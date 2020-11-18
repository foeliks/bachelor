import React, { useState, useEffect } from 'react';
import {
    PageHeader,
    Progress,
    Collapse,
    Button,
    Checkbox,
    Row,
    Col
} from 'antd';
import {
    StarOutlined,
    StarFilled,
} from '@ant-design/icons';

function Categories(props) {

    const [categories, setCategories] = useState({ stars_sum: 0, tasks: [] });

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
            .catch(error => console.error(error))
    }, [props.functions])

    return (
        <div>
            <Row justify="space-between" align="middle">
                <PageHeader title="Themen" />
                <div style={{marginRight: "16px"}}>{categories.stars_sum} <StarFilled /></div>
            </Row>
            <Collapse>
                {categories.tasks.map(category => {
                    return (
                        <Collapse.Panel key={category.id} header={category.title} extra={<Progress percent={category.progress} />}>
                            {category.tasks.map(task => {
                                return (
                                    <div style={{ marginTop: "10px" }} key={task.id}>
                                        <Button href={`/task/${task.id}`} style={task.solved ? { backgroundColor: props.values.robobGreen, color: 'white' } : {}} >
                                            Aufgabe {task.id}{task.optional ? " (optional)" : ""}
                                        </Button>
                                        {task.solved && <div style={{ float: "right" }}>
                                            {task.stars === 3 ? <StarFilled /> : <StarOutlined />}
                                            {task.stars >= 2 ? <StarFilled /> : <StarOutlined />}
                                            <StarFilled />
                                        </div>}
                                        <br />
                                    </div>
                                )
                            })}
                        </Collapse.Panel>)
                })}
            </Collapse>
            <Checkbox disabled={props.values.nextTaskWithoutOptional === 0} style={{ marginTop: "20px" }} onChange={(event) => props.functions.setIgnoreOptional(event.target.checked)} >Optionale Aufgaben ignorieren</Checkbox>
            <br />
            <Button style={{ marginTop: "10px" }} type="primary" href={`/task/${props.values.ignoreOptional ? props.values.nextTaskWithoutOptional : props.values.nextTaskWithOptional}`}>Fortsetzen</Button>
        </div>
    );


}

export default Categories;