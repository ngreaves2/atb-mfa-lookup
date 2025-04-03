import React, { useState, useEffect } from "react";
import { useAuth } from "../api/server/authContext";

export const ProtectedData = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const { isAuthenticated } = useAuth();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:3000/time", {
                    method: "GET",
                    credentials: "include", // Send cookies with the request
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": true,
                    },
                });

                const data = await response.json();
                setData(data);
            } catch (err) {
                setError("Error Fetching Data: " + err.message);
            }
        };

        fetchData();
    }, []);

    // Helper function to format dates
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (error) return <p>Error: {error}</p>;
    if (!data) return;

    return (
        <div>
            {isAuthenticated ? (
                <pre>{formatDate(data.server_time.now)}</pre>
            ): (
                <pre>Please Login</pre>
            )}
        </div>
    );
};