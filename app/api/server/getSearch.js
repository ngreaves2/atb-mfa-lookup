export const GetSearch = async (filters, token) => {
    try {
        if (!filters || typeof filters !== "object") {
            throw new Error("Invalid filters provided");
        }
        
        // Convert filter object to query string (e.g., { name: "John" } -> "?name=John")
        const queryParams = new URLSearchParams(filters).toString();
        const apiUrl = `http://localhost:3000/search?${queryParams}`;

        console.log("[Get Search] Constructed API URL:", apiUrl); 

        if (!apiUrl || apiUrl.includes("undefined") || apiUrl.includes("null")) {
            throw new Error("Invalid API URL!");
        }

        const response = await fetch(apiUrl, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
            },
        })

        if (!response.ok)
            return { status: "Not Found", message: `No ${filters.searchMethod} Matches ${filters.search}`};

        const data = await response.json();

        return { status: "Success", message: "Found Result", data: data };
    } catch (error) {
        console.error("Error fetching search results: ", error);
        return [];
    }
};
