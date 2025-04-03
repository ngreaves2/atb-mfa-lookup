import React, { useState } from 'react';

export const SearchTypeDropDown = ({ callback }) => {
    const [searchMethod, setSearchMethod] = useState("Name");
    const searchParameterTypes = ['Name', 'MFA', 'Email'];

    const [hover, setHover] = React.useState(false);

    const handleChange = (event) => {
        const selectedMethod = event.target.value;
        setSearchMethod(selectedMethod);
        callback(selectedMethod);
        console.log(selectedMethod);
    };

    const optionItems = searchParameterTypes.map((type) => (
        <option key={type} value={type}>
            {type.split('_').join(' ')}
        </option>
    ));

    const styles = {
        container: {
            padding: '20px',
            maxWidth: '400px',
            margin: '0 auto',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
        },
        label: {
            display: 'block',
            marginBottom: '10px',
            fontSize: '1rem',
            color: '#333',
            fontWeight: 'bold',
        },
        select: {
            width: '100%',
            padding: '10px',
            fontSize: '1rem',
            color: '#333',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#ddd',
            borderRadius: '5px',
            backgroundColor: '#f4f4f9',
            cursor: 'pointer',
        },
        selectHover: {
            borderColor: '#0072f0',
        },
    };

    return (
        <div>
            <select
                id="dropdown"
                value={searchMethod}
                onChange={handleChange}
                style={hover ? { ...styles.select, ...styles.selectHover } : styles.select}
                onMouseOver={() => setHover(true)}
                onMouseOut={() => setHover(false)}
            >
                {optionItems}
            </select>
        </div>
    );
};