'use client'

import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const accounts = [];


export default function SearchBar({ style }) {
    const { isLoading, isAuthenticated } = useAuth0();
    const [inputValue, setInputValue] = useState("");
    const MAX_AMOUNT_OF_INPUT = 50;

    const listItemStyle = {
        color: 'white'
    }

    if (isLoading)
        return <div>Loading Search Bar...</div>

    if (!isAuthenticated)
        return <div>Please Login</div>

    let numOfSearches = 0;

    const handleChange = (event) => {
        let keyword = event.target.value; // GET KEYWORD INPUT FROM TEXTBOX 
        const accountListContainer = document.getElementById('accountListContainer');

        if (keyword.length > MAX_AMOUNT_OF_INPUT) {
            console.log("Max Input Size");
            accountListContainer.innerHTML = "You've Reached The Max Amount of Characters, Please Rephrase Your Search."
            return;
        }

        if (!keyword || keyword === "") {
            accountListContainer.innerHTML
            return;
        }

        //******* Displays ONLY Array Elements That Have A Matching String With The Query  **********/
        const regexp = new RegExp(`(${keyword})`, "i")
        const filtered = accounts.filter(entry => Object.values(entry).some(val => typeof val === "string" && val.match(regexp)));

        //******* Displays ALL Array Elements **********/
        // Keep Track of Searches
        numOfSearches++;
        if (numOfSearches > 0)
            accountListContainer.innerHTML = " ";

        // Get Accounts
        if (!accountListContainer)
            return;

        // Create a list based on the amount of account matching search query
        let markup = `<div>`;
        markup += `<ul>`
        for (let i = 0; i < filtered.length; i++) {
            markup += `<li key="${i}"><strong>Name:</strong> ${filtered[i].name} <br> 
            <strong>Email:</strong> ${filtered[i].email} <br> 
            <strong>Phone #:</strong> ${filtered[i].phoneNumber} <br> 
            <strong>MFA Method:</strong> ${filtered[i].mfaMethod}</li>`;
            markup += `--------`;
        }

        markup += `</ul>`;
        markup += `</div>`;

        accountListContainer.innerHTML += markup;
    };

    return (
        <>
            <textarea
                id="searchField"
                name="searchField"
                placeholder="Search..."
                style={style}
                rows={4}
                cols={40}
                onChange={handleChange}
            />
            <div id='accountListContainer' style={listItemStyle}></div>

        </>
    );
}