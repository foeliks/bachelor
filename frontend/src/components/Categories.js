import React from 'react';
import axios from 'axios';
import {
    Button
} from 'antd';

function Categories() {
    axios
        .get('http://localhost:8000/api/categories/')
        .then(res => console.log(res.data))
        .catch(err => console.log(err))
    return (
        <div>
            <h1>Categories</h1>
            <Button onClick={()=>{
                console.log(localStorage.getItem('token'));
            }}>
                Print Token
            </Button>
        </div>
    );
}

export default Categories;