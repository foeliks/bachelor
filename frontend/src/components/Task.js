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
    Collapse
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
        setSubmitted(false)
        setCodeResult(userSolution);

        fetch(`http://localhost:8000/robob/add-solution/`, {
            method: 'post',
            headers: {
                'Authorization': `JWT ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "task_id": task.id,
                "solution": userSolution,
                "user_solution": completeCode
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
                else if (res.status !== 200) {
                    props.functions.logOut();
                }
            })
            .catch(error => console.log(error))
    }

    const successScreen = (
        <Card style={{ backgroundColor: 'light-green' }}>
            <h1>Geschafft!</h1>
        </Card>
    )

    if (props.values.gameMode) {
        return (
            <h1>Aufgabe als Spiel</h1>
        )
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
                    onBack={() => history.push('/overview')}
                />
                {task.stars > 0 ? <div>
                    {task.stars === 3 ? <StarFilled /> : <StarOutlined />}
                    {task.stars >= 2 ? <StarFilled /> : <StarOutlined />}
                    <StarFilled />
                </div> : <div />}
            </Row>
            {success ? successScreen : <div />}
            <Card title="Aufgabenstellung" style={{ marginBottom: "10px" }}>
                <div dangerouslySetInnerHTML={{ __html: task.description }} />
            </Card>
            {task.knowledge ? knowledgeBody : <div />}
            {
                !task.multiple_choice &&
                <div>
                    <Card title="Eingabe" style={
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
                    <Card title="Ausgabe" style={submitted && codeFailed ? { backgroundColor: 'red', marginTop: "10px" } : { marginTop: "10px" }}>
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
        </div>);
}

export default Task;