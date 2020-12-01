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
                <div style={{ marginRight: "16px" }}>{props.values.sumStars} <StarFilled /></div>
            </Row>
            <Collapse>
                {props.values.categories.map(category => {
                    return (
                        <Collapse.Panel key={category.id} header={category.title} extra={<Progress percent={category.progress.toFixed()} />}>
                            {category.tasks.map(task => {
                                return (
                                    <div style={{ marginTop: "10px" }} key={task.id}>
                                        <Row justify="space-between" align="middle">
                                            <Row align="middle" style={{ marginLeft: "10px", color: "grey" }}>
                                                <Button 
                                                    danger={
                                                        (task.required_employee_rank && props.values.employeeRank.id < task.required_employee_rank.id) || 
                                                        (task.achieve_employee_rank && !props.functions.solvedNeededTasks(category.id)) ||
                                                        (task.required_stars && props.values.sumStars < task.required_stars)} 
                                                    href={`/task/${task.id}`} 
                                                    style={task.solved ? { backgroundColor: props.values.robobGreen, color: 'white', marginRight: '10px' } : {marginRight: '10px'}} >
                                                    Aufgabe {task.id}
                                                </Button>
                                                {(task.required_employee_rank && props.values.employeeRank.id < task.required_employee_rank.id) ? `(Mitarbeiter Rang "${task.required_employee_rank.title}" benötigt)`
                                                    : (task.achieve_employee_rank && !props.functions.solvedNeededTasks(category.id)) ? "(Nicht alle Pflicht-Aufgaben gelöst)"
                                                    : (task.required_stars && props.values.sumStars < task.required_stars) ? <div>({task.required_stars}  <StarFilled /> benötigt)</div> 
                                                    : task.achieve_employee_rank ? `(Rang Aufstieg: ${task.achieve_employee_rank.title})`
                                                    : task.optional ? "(optional)" : ""}
                                            </Row>
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
            <Button style={{ marginTop: "10px" }} type="primary" href={`/task/${props.values.ignoreOptional ? props.values.nextTaskWithoutOptional : props.values.nextTaskWithOptional}`}>Nächste Aufgabe</Button>
        </div>
    );


}

export default Categories;