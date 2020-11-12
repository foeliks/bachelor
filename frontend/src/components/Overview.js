import React, { useState, useEffect } from 'react';
import {
    PageHeader,
    Progress,
    Collapse,
    Button,
    Checkbox
} from 'antd';
import {
    StarOutlined,
    StarFilled,
} from '@ant-design/icons';

function Categories(props) {

    const [categories, setCategories] = useState([]);
    const [ignoreOptional, setIgnoreOptional] = useState(false);

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
                            {category.tasks.map(task => {
                                return (
                                    <div style={{ marginTop: "10px" }} key={task.id}>
                                        <Button href={`/task/${task.id}`} style={task.solved ? { backgroundColor: 'green', color: 'white' } : {}} >
                                            Aufgabe {task.id}{task.optional ? " (optional)" : ""}
                                        </Button>
                                        {task.solved ? <div style={{ float: "right" }}>
                                            {task.stars === 3 ? <StarFilled /> : <StarOutlined />}
                                            {task.stars >= 2 ? <StarFilled /> : <StarOutlined />}
                                            <StarFilled />
                                        </div> : <div />}
                                        <br />
                                    </div>
                                )
                            })}
                            <Button style={{float: "right", marginBottom: "10px" }} type="danger">Kapitel zurücksetzen</Button>
                        </Collapse.Panel>)
                })}
            </Collapse>
            <Checkbox disabled={props.values.nextTaskWithoutOptional === 0} style={{ marginTop: "20px" }} onChange={(event) => setIgnoreOptional(event.target.checked)} >Optionale Aufgaben ignorieren</Checkbox>
            <br />
            <Button style={{ marginTop: "10px" }} type="primary" href={`/task/${ignoreOptional ? props.values.nextTaskWithoutOptional : props.values.nextTaskWithOptional}`}>Fortsetzen</Button>
        </div>
    );


}

export default Categories;