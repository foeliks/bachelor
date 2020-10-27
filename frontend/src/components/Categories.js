import React, { useState, useEffect } from 'react';
import {
    PageHeader
} from 'antd';

function Categories(props) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/categories/', {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                if(res.status !== 200){
                    setCategories([]);
                    props.functions.logOut();
                }
                else {
                    res.json()
                    .then(json => {
                        setCategories(json);
                        props.functions.setRedirect(false);
                    })
                }
            })
            .catch(error => console.log(error))
    }, [props.functions])

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