import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
    PageHeader
} from 'antd';
import PageLayout from './PageLayout';

function Categories(props) {
    const [categories, setCategories] = useState([]);
    const history = useHistory();
    const [loggedIn, setLoggedIn] = useState(props.values.loggedIn)
    useEffect(() => {
        fetch('http://localhost:8000/api/categories/', {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(json => setCategories(json))
            .catch(err => {
                console.log(err);
                setCategories([]);
                localStorage.removeItem('token');
                props.functions.setLoggedIn(false);
                history.push("/");
            })
    }, [])
    return (
        <div>
            <PageHeader title="Themen" />
            <ul>
                {props.values.loggedIn && categories.map(element => {
                    return <li key={element.id}>{element.title}</li>
                })}
            </ul>
        </div>
    );

}

export default Categories;