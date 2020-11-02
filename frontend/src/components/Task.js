import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    PageHeader,
    Card,
    Input,
    Switch,
    Button,
    Row,
    Col
} from 'antd';


function Task(props) {
    const { taskId } = useParams();
    const [task, setTask] = useState({});
    const [hackerMode, setHackerMode] = useState(false);
    const [textarea, setTextarea] = useState("");
    const [codeFailed, setCodeFailed] = useState(false);
    const [codeResult, setCodeResult] = useState("");
    const [submitted, setSubmitted] = useState(false);

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
                if (res.status === 220) {
                    alert("SUCCESS!")
                }
                else if (res.status !== 200) {
                    props.functions.logOut();
                }
            })
            .catch(error => console.log(error))
    }

    if (props.values.gameMode) {
        return (
            <h1>Hier kommt das Spiel hin</h1>
        )
    }
    return (
        <div>
            <PageHeader title={`Aufgabe ${task.id} ${task.optional ? " (optional)" : ""}`} />
            <Card style={{ marginBottom: "10px" }}>
                <div dangerouslySetInnerHTML={{ __html: task.description }} />
            </Card>
            {!task.multiple_choice &&
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
                    <Card style={submitted && codeFailed ? { backgroundColor: 'red', marginTop: "10px" } : { marginTop: "10px" }}>
                        <p>{codeResult}</p>
                    </Card>
                </div>}
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
        </div >
    );
}

export default Task;