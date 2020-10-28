import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    PageHeader,
    Card,
    Form,
    Input,
    Switch,
    Button,
    Row,
    Col
} from 'antd';


function Task(props) {
    const { categoryId } = useParams();
    const [task, setTask] = useState({});
    const [hackerMode, setHackerMode] = useState(false);
    useEffect(() => {
        fetch(`http://localhost:8000/robob/task/${categoryId}`, {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    setTask({});
                    props.functions.logOut();
                }
                else {
                    res.json()
                        .then(json => {
                            setTask(json);
                            props.functions.setRedirect(false);
                        })
                }
            })
            .catch(error => console.log(error))
    }, [props.functions])

    return (
        <div>
            <PageHeader title="Aufgabe" />
            <Card>
                <div dangerouslySetInnerHTML={{ __html: task.description }} />
            </Card>
            <Form>
                <Form.Item name="solution">
                    <Input.TextArea style={
                        hackerMode ? {
                            color: 'green',
                            backgroundColor: 'black',
                            fontFamily: 'Hack'
                        } : { fontFamily: 'Hack' }}
                        autoFocus onKeyDown={(event) => {
                            if (event.keyCode == 9) {
                                event.preventDefault()
                                event.target.value += "\t";
                            }
                        }
                        } />
                </Form.Item>
                <Row justify="space-between">
                    <Col>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Bestätigen</Button>
                        </Form.Item>
                    </Col>
                    <Col >
                        <label >Hacker-Mode </label>
                        <Switch style={{ flexDirection: 'row', justifyContent: 'flex-end' }} onChange={(checked) => setHackerMode(checked)} />
                    </Col>
                </Row>
            </Form>

        </div>
    );
}

export default Task;