import React, { useState, useEffect } from 'react';
import {
    PageHeader,
    Progress,
    Collapse,
    Button,
    Checkbox,
    Row
} from 'antd';
import {
    StarOutlined,
    StarFilled,
} from '@ant-design/icons';

function Categories(props) {


    return (
        <div>
            <Row justify="space-between" align="middle">
                <PageHeader title="Themen" />
                <div style={{marginRight: "16px"}}>{props.values.categories.stars_sum} <StarFilled /></div>
            </Row>
            <Collapse>
                {props.values.categories.tasks.map(category => {
                    return (
                        <Collapse.Panel key={category.id} header={category.title} extra={<Progress percent={category.progress} />}>
                            {category.tasks.map(task => {
                                return (
                                    <div style={{ marginTop: "10px" }} key={task.id}>
                                        <Row align="middle">
                                        <Button danger={task.required_stars && (!props.values.sum_stars || (props.values.sum_stars < task.required_keys))} href={`/task/${task.id}`} style={task.solved ? { backgroundColor: props.values.robobGreen, color: 'white' } : {}} >
                                            Aufgabe {task.id}
                                        </Button>
                                        <div  style={{marginLeft: "10px", color: "grey"}}>{task.optional ? "(optional)" : ""}{task.required_stars ? <div>({task.required_stars}  <StarFilled /> benötigt)</div> : ""}</div>
                                        {task.solved && <div style={{ float: "right" }}>
                                            {task.stars === 3 ? <StarFilled /> : <StarOutlined />}
                                            {task.stars >= 2 ? <StarFilled /> : <StarOutlined />}
                                            <StarFilled />
                                        </div>
                                        }
                                        </Row>
                                    </div>
                                )
                            })}
                        </Collapse.Panel>)
                })}
            </Collapse>
            <Checkbox checked={props.values.ignoreOptional} disabled={props.values.nextTaskWithoutOptional === 0} style={{ marginTop: "20px" }} onChange={(event) => props.functions.setIgnoreOptional(event.target.checked)} >Optionale Aufgaben ignorieren</Checkbox>
            <br />
            <Button style={{ marginTop: "10px" }} type="primary" href={`/task/${props.values.ignoreOptional ? props.values.nextTaskWithoutOptional : props.values.nextTaskWithOptional}`}>Fortsetzen</Button>
        </div>
    );


}

export default Categories;