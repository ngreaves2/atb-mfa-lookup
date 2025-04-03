import { OktaAuth } from "@okta/okta-auth-js";

const oktaAuth = new OktaAuth({
    issuer: 'https://dev-lj2fgkappxmqsrge.us.auth0.com/oauth2/default',
    url: 'https://dev-lj2fgkappxmqsrge.us.auth0.com/',
    clientId: `JiaFtfAPdFW3rArItaQfWNFTxRo2LDxx`,
    redirectUri: "http://localhost:3001" + "/login/callback",
    scopes: ["openid", "profile", "email"],
    tokenManager: {
        token: {
            storageTypes: ['cookie']
          },
        autoRenew: true, // Automatically refresh tokens
        expireEarlySeconds: 30, // Refresh token 30s before expiration
    },
});

export default oktaAuth;