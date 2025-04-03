import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
    jwksUri: 'https://dev-lj2fgkappxmqsrge.us.auth0.com/.well-known/jwks.json',
});


const getKey = (header, callback) => {

    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err);
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(
        token,
        getKey,
        {
            algorithms: ['RS256'], // Auth0 uses RS256 by default
            issuer: 'https://dev-lj2fgkappxmqsrge.us.auth0.com/',
            audience: 'https://dev-lj2fgkappxmqsrge.us.auth0.com/api/v2/',
        },
        (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Token verification failed', error: err + " | token: " + token });
            }

            req.user = decoded;
            next();
        }
    );
};
