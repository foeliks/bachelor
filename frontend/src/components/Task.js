import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
    PageHeader,
    Card,
    Input,
    Switch,
    Button,
    Row,
    Col,
    Collapse,
    Checkbox
} from 'antd';
import {
    StarOutlined,
    StarFilled,
} from '@ant-design/icons';

function Task(props) {
    const { taskId } = useParams();
    const history = useHistory();

    const [task, setTask] = useState({});
    const [hackerMode, setHackerMode] = useState(false);
    const [textarea, setTextarea] = useState("");
    const [codeFailed, setCodeFailed] = useState(false);
    const [codeResult, setCodeResult] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [success, setSuccess] = useState(false);
    const [ignoreOptional, setIgnoreOptional] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8000/robob/task/${taskId}`, {
            headers: {
                'Authorization': `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    setTask({});
                    props.functions.logOut();
                }
                else {
                    res.json()
                        .then(json => setTask(json))
                }
            })
            .catch(error => console.log(error))

    }, [props.functions, taskId])

    useEffect(() => {
        if (submitted) {

            fetch(`http://localhost:8000/robob/add-solution/`, {
                method: 'post',
                headers: {
                    'Authorization': `JWT ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "task_id": task.id,
                    "solution": codeResult,
                    "user_solution": task.placeholder_before + '\n' + textarea + '\n' + task.placeholder_after
                })
            })
                .then(res => {
                    if (res.status === 202) {
                        setSuccess(true);
                        res.json().then(json => {
                            let new_task = task;
                            new_task.stars = json.stars;
                            setTask(new_task);
                        })
                    }
                    else if (res.status === 200) {
                        res.json().then(json => {
                            let new_task = task;
                            new_task.tries = json.tries;
                            setTask(new_task);
                        })
                    }
                    else {
                        props.functions.logOut();
                    }
                })
                .catch(error => console.log(error))

            setSubmitted(false)
        }
    }, [codeResult, submitted, props.functions, textarea, task])

    const submitCode = () => {
        let userSolution = "";
        const completeCode = task.placeholder_before + '\n' + textarea + '\n' + task.placeholder_after;
        try {
            const runCode = new Function(completeCode);
            userSolution = runCode() === undefined ? "" : String(runCode());
            setCodeFailed(false);
        }
        catch (error) {
            userSolution = error.message;
            setCodeFailed(true);
        }
        setCodeResult(userSolution);
    }

    const successScreen = (
        <Card style={{ backgroundColor: 'green' }}>
            <h1>Geschafft!</h1>
            <Checkbox disabled={props.values.nextTaskWithoutOptional === 0} style={{ marginTop: "20px" }} onChange={(event) => setIgnoreOptional(event.target.checked)} >Optionale Aufgaben ignorieren</Checkbox>
            <br />
            <Button style={{ marginTop: "10px" }} type="primary" href={`/task/${ignoreOptional ? props.values.nextTaskWithoutOptional : props.values.nextTaskWithOptional}`}>Fortsetzen</Button>
        </Card>
    )

    if (props.values.gameMode) {
        return <h1>Aufgabe als Spiel</h1>
    }

    const knowledgeBody =
        <Collapse defaultActiveKey="1" style={{ marginBottom: "10px" }}>
            <Collapse.Panel key="1" header="Info">
                <div dangerouslySetInnerHTML={{ __html: task.knowledge }} />
                <p style={{ marginTop: "10px", color: "grey" }}>PS: Du kannst alle Infos auch nochmal im <a href="/diary">Tagebuch</a> nachlesen</p>
            </Collapse.Panel>
        </Collapse>
        
    return (
        <div>
            <Row justify="space-between" align="middle">
                <PageHeader
                    title={`Aufgabe ${task.id} ${task.optional ? " (optional)" : ""}`}
                    onBack={() => history.goBack()}
                />
                Versuche: {task.tries}
                {task.stars > 0 ? <div>
                    {task.stars === 3 ? <StarFilled /> : <StarOutlined />}
                    {task.stars >= 2 ? <StarFilled /> : <StarOutlined />}
                    <StarFilled />
                </div> : <div />}
            </Row>
            <Card title="Aufgabenstellung" style={{ marginBottom: "10px" }}>
                <div dangerouslySetInnerHTML={{ __html: task.description }} />
            </Card>
            {task.knowledge ? knowledgeBody : <div />}
            {
                !task.multiple_choice &&
                <div>
                    <Card style={
                        hackerMode ? {
                            color: 'green',
                            backgroundColor: 'black',
                            fontFamily: 'Hack'
                        } : { fontFamily: 'Hack' }}>
                        <p>{task.placeholder_before}</p>
                        <Input.TextArea style={
                            hackerMode ? {
                                color: 'green',
                                backgroundColor: 'black',
                                fontFamily: 'Hack'
                            } : { fontFamily: 'Hack' }}
                            onKeyDown={(event) => {
                                if (event.keyCode === 9) {
                                    event.preventDefault();
                                    const cursor = event.target.selectionEnd;
                                    event.target.value = event.target.value.substring(0, cursor) + "\t" + event.target.value.substring(cursor, event.target.value.length);
                                    event.target.selectionEnd = cursor + 1;
                                }
                            }}
                            onChange={() => setTextarea(document.getElementById("textarea").value)}
                            autoFocus
                            spellCheck={false}
                            id="textarea"
                            rows={5} />

                        <p>{task.placeholder_after}</p>
                    </Card>
                    <Card title="Ausgabe" style={codeFailed ? { backgroundColor: 'red', marginTop: "10px" } : { marginTop: "10px" }}>
                        <p>{codeResult}</p>
                    </Card>
                </div>
            }
            <Row style={{ marginTop: "10px" }} justify="space-between">
                <Col>
                    <Button
                        type="primary"
                        onClick={() => {
                            submitCode();
                            setSubmitted(true);
                        }}>Bestätigen</Button>
                </Col>
                <Col >
                    <label >Hacker-Mode </label>
                    <Switch style={{ flexDirection: 'row', justifyContent: 'flex-end' }} onChange={(checked) => {
                        setHackerMode(checked);
                        document.getElementById("textarea").value = textarea;
                    }} />
                </Col>
            </Row>
            {success ? successScreen : <div />}
        </div>);
}

export default Task;