'use client'

import { ProtectedData } from "./Componenets/protectedData";

import { QueryResult } from "./Componenets/queryResult";

import { LoginButton } from './Componenets/loginButton';
import { AuthProvider } from "./api/server/authContext";

// import { Auth0Provider as OktaAuthProvider } from "@auth0/auth0-react";
import { Security } from '@okta/okta-react';
import { OktaAuth } from '@okta/okta-auth-js';

import oktaAuth from "./oktaAuth";

import dotenv from "dotenv";


export default function HomePage() {
  // const navigate = useNavigate(); // Access the history object for navigation

  // Define the restoreOriginalUri callback
  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    window.location.href = originalUri || 'http://localhost:3001';
  };

  const styles = {
    body: {
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      padding: 0,
      backgroundColor: '#f4f4f9',
      color: '#333',
    },
    header: {
      backgroundColor: '#0072f0',
      color: '#fff',
      padding: '20px',
      textAlign: 'center',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    h1: {
      textAlign: 'center' /* Centers the text horizontally */
    },
    date: {
      textAlign: 'center', /* Ensures the date aligns horizontally in the center */
      marginFop: '5%', /* Adds some spacing if needed */
    },

    main: {
      textAlign: 'center',
      padding: '30px',
      maxWidth: '800px',
      margin: '20px auto',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
    },
    button: {
      backgroundColor: '#0072f0',
      color: '#fff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '5px',
      fontSize: '1rem',
      cursor: 'pointer',
    },
    buttonHover: {
      backgroundColor: '#005bb5',
    },
    footer: {
      textAlign: 'center',
      padding: '15px',
      backgroundColor: '#0072f0',
      color: '#fff',
      fontSize: '0.875rem',
    },
  };

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <AuthProvider oktaAuth={oktaAuth} className={styles.body}>
          <header style={styles.header}>ATB Multi-Factor Authentication (MFA) Account Search</header>

          <main style={styles.main}>
            <h1 style={styles.h1}>Multi-Factor Authentication Look-up</h1>
            <ProtectedData style={styles.date}></ProtectedData>
            <LoginButton className={styles.button}></LoginButton>

            <QueryResult></QueryResult>
          </main>
          <footer style={styles.footer}>© 2025 ATB. All rights reserved.</footer>
        </AuthProvider>
     </Security>
  );
}