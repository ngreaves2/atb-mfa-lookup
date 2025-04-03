import { useEffect, useState } from "react";

import oktaAuth from "../oktaAuth";

const useAuthToken = () => {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const getToken = async () => {
            try {
                console.log("Fetching token from Okta...");

                const storedToken = await oktaAuth.tokenManager.get("accessToken");
                if (!storedToken) {
                    console.warn("No access token found in Okta token manager");
                } else {
                    setToken(storedToken.accessToken); // Store token
                }
                
            } catch (error) {
                console.error("Error fetching token from Okta:", error);
            }
        };

        getToken();
    }, [token]);

    return token;
};

export default useAuthToken;