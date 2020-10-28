import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams
} from "react-router-dom";
import {
    PageHeader,
    Progress,
    Collapse,
    Button
} from 'antd';

function Categories(props) {

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/robob/category-progress/', {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
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
            <Collapse>
                {categories.map(category => {
                    return (
                        <Collapse.Panel key={category.id} header={category.title} extra={<Progress percent={category.progress} />}>
                            <ul>
                                {category.tasks.map(task => {
                                    return <li key={task.id} style={task.solved ? { color: 'green' } : {}} >
                                        {task.id} {task.optional ? "(optional)" : ""}
                                    </li>
                                })}
                            </ul>
                            <Button href={`/categories/${category.id}`}>Fortsetzen</Button>
                        </Collapse.Panel>)
                })}
            </Collapse>
        </div>
    );


}

export default Categories;