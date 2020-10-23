import React from 'react';
import axios from 'axios';

function Categories() {
    axios
        .get('http://localhost:8000/api/categories/')
        .then(res => console.log(res.data))
        .catch(err => console.log(err))
    return (

        <p>Categories</p>
    );
}

export default Categories;