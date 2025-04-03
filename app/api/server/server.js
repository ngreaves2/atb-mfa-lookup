import express from 'express';
import db from './database.js';
import { authenticateToken } from './authMiddleware.js';

import axios from 'axios';
import qs from 'qs';
import crypto from 'node:crypto';

import cors from "cors";
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import dotenv from "dotenv";

import helmet from 'helmet';


const app = express();
const PORT = process.env.PORT || 3000;
const env = dotenv.config({ path: '../../../.env' });


// ====== Tools & Operations ======

// Generate a random code verifier
const generateCodeVerifier = () => {
    const array = crypto.randomBytes(32);
    return array.toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

// Generate a code challenge (SHA-256 hash of the code verifier)
const generateCodeChallenge = (codeVerifier) => {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    return hash.toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

// Generate random state
const generateState = () => {   // The spread operator (...) uses each bit as an argument to stringFromCharCode
    return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
}

const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);
const state = generateState();

// ====== SERVER ======

app.use(
    cors({
        origin: "http://localhost:3001", // Allow frontend
        methods: "GET, POST, PUT, DELETE",
        allowedHeaders: "Content-Type, Authorization, Access-Control-Allow-Credentials, Origin, X-Requested-With, Accept",
        credentials: true, // Allow cookies
    })
);

app.use(express.json());
app.use(cookieParser()); // Enables reading/writing cookies`
// app.use(helmet.frameguard());
// app.disable('x-powered-by');

// MOVE TO ENVIRONMENT VARIABLES
const clientId = `${process.env.OKTA_CLIENT_ID}`;
const oktaDomain = `${process.env.OKTA_DOMAIN}`;
const clientSecret = `${process.env.OKTA_CLIENT_SECRET}`;
const oktaIssuer = `${process.env.OKTA_ISSUER}`
const audience = `${process.env.OKTA_AUDIENCE}`;
const redirectUri = 'http://localhost:3000/token';

app.get('/auth/initiate', (req, res) => {
    const authUrl = `${oktaDomain}/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `audience=${audience}&` +
        `scope=openid%20email%20profile&` + // %20 URI encoded for space
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `code_challenge_method=S256&` +
        `code_challenge=${codeChallenge}`;

    res.json({ url: authUrl });
});

app.get("/token", async (req, res) => {
    console.log("Token Route");
    const authCode = req.query.code;

    let data = qs.stringify({
        'grant_type': 'authorization_code',
        'code': `${authCode}`,
        'audience': `${audience}`,
        'client_id': `${clientId}`,
        'client_secret': `${clientSecret}`,
        'redirect_uri': `${redirectUri}`,
        'code_verifier': `${codeVerifier}`,
        'code_challenge_method': 'S256',
        'code_challenge': `${codeChallenge}`,
    });

    let config = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: 'https://dev-lj2fgkappxmqsrge.us.auth0.com/oauth/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            res.cookie('access_token', response.data.access_token, {
                httpOnly: true,
                secure: true, // true in production with HTTPS
                sameSite: 'Strict',
                maxAge: 60 * 60 * 1000, // 1 hour timer on expiration
            });

            res.cookie('id_token', response.data.id_token, {
                httpOnly: true,
                secure: true, // true in production with HTTPS
                sameSite: 'Strict',
                maxAge: 60 * 60 * 1000, // 1 hour timer on expiration
            });

            res.redirect('http://localhost:3001');
        })
        .catch((error) => {
            if (error.response) {
                console.error('Error details:', error.response.status, error.response.data);
            } else {
                console.error('Error in request:', error.message);
            }
        });

});

app.get('/auth/me', (req, res) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        // NOT VERIFYING TOKEN
        const decoded = jwt.decode(token);
        res.json({ user: decoded });
    } catch (err) {
        console.error('Error decoding token:', err);
        res.status(401).json({ message: 'Invalid token' });
    }

    return res;
});

// Logout - Clears the Cookie
app.post('/auth/logout', (req, res) => {
    console.log("Logout Called");
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
    });

    res.clearCookie('id_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    });

    res.status(200).redirect('http://localhost:3001');
});

app.get("/time", authenticateToken, async (request, response) => {
    console.log("[Server] Time Called");
    try {
        const result = await db.query("SELECT NOW()");
        response.json({ server_time: result[0] });
    } catch (err) {
        response.status(500).json({ error: "Database query failed" });
    }

    return response;
});

app.get("/search", authenticateToken, async (request, response) => {
    console.log("[Server] Received API request!");

    try {
        const filters = request.query;
        console.log("[Server] Received filters:", filters);

        // Validate column name (searchMethod)
        const allowedColumns = ['name', 'mfa', 'email'];
        const column = allowedColumns.includes(filters.searchMethod?.toLowerCase())
            ? filters.searchMethod.toLowerCase()
            : null;

        if (!column) {
            return response.status(400).json({ error: "Invalid search method" });
        }

        // Validate search term
        if (!filters.search) {
            return response.status(400).json({ error: "Search term is required" });
        }

        const searchTerm = [`%${filters.search}%`];
        const result = await db.query(`SELECT * FROM atb WHERE ${column} ILIKE $1`, searchTerm);
        if (!result || result.length === 0) {
            console.warn("[Server] No results found!");
            return response.status(404).json({ message: "No results found" });
        }

        console.log("[Server] Database Query Result:", result);
        response.json({ server_result: result });


    } catch (err) {
        console.error("Error fetching result:", err);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Public route (No auth required)
app.get("/", (request, response) => {
    response.send("Welcome to the API!");
});

app.post('/auth/revoke', async (req, res) => {
    try {
        // Get the cookie from the client request
        const accessToken = req.cookies.access_token; // Ensure your frontend sets this cookie
        if (!accessToken) {
            return res.status(401).json({ error: 'Access token missing' });
        }

        const idToken = req.cookies.id_token; // Retrieve the ID token from cookies

        if (!idToken) {
            console.error('ID token missing');
            return res.status(401).json({ error: 'ID token missing' });
        }

        // Construct the Okta logout URL
        const logoutUrl = `https://dev-lj2fgkappxmqsrge.us.auth0.com/v2/logout?` 
        + `id_token_hint=${idToken}&`
        + `post_logout_redirect_uri=http://localhost:3001`;

        // Clear authentication cookies securely
        res.clearCookie('access_token', { httpOnly: true, secure: true, sameSite: 'Strict' });
        res.clearCookie('id_token', { httpOnly: true, secure: true, sameSite: 'Strict' });

        res.status(200).json({ logoutUrl });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Gracefully close database connection on shutdown
process.on('SIGINT', async () => {

    // clear cookies
    //response.clearCookie(AUTH_TOKEN);

    await db.close();
    process.exit(0);
});

// Start server
app.listen(PORT, () => console.log(`[Server] Server running on port ${PORT}`));
