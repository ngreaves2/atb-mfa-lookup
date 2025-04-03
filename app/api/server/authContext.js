import React, { createContext, useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const { authState, oktaAuth } = useOktaAuth();

    useEffect(() => {
        const checkAuth = async () => {
            const response = await fetch('http://localhost:3000/auth/me', {
                credentials: 'include', // Send cookies
            });
            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUser(data.user);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        }

        checkAuth();

        if (authState?.isAuthenticated) {
            setIsAuthenticated(true);
            setUser(authState.idToken.claims); // Get user claims from Okta token
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [authState]);

    const login = async () => {
        const response = await fetch('http://localhost:3000/auth/initiate');
        const data = await response.json();
        window.location.href = data.url;
    };

    const logout = async () => {
        try {
            // Call the backend proxy to revoke the access token
            const response = await fetch('http://localhost:3000/auth/revoke', {
                method: 'POST',
                credentials: 'include', // include cookies
            });

            if (response.ok) {
                const data = await response.json();
                if (data.logoutUrl) {
                    // Perform the browser redirect to the logout URL
                    window.location.href = data.logoutUrl;
                } else {
                    console.error("No logout URL returned from server.");
                }
            } else {
                const errorData = await response.json();
                console.error("Logout failed:", errorData);
            }

            // Clear local state
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};