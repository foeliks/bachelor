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
                        .then(json => {
                            setTask(json);
                        })
                }
            })
            .catch(error => console.log(error))

    }, [props.functions, taskId])

    const submitCode = () => {
        let userSolution = "";
        try {
            const runCode = new Function(textarea);
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
                "user_solution": textarea
            })
        })
            .then(res => {
                if (res.status !== 200) {
                    props.functions.logOut();
                }
                else {
                    console.log(res)
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
            <PageHeader title="Aufgabe" />
            <Card>
                <div dangerouslySetInnerHTML={{ __html: task.description }} />
            </Card>
            {!task.multiple_choice &&
                <div>
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
                    <Card style={submitted ? codeFailed ? { backgroundColor: 'red' } : { backgroundColor: 'green' } : {}}>
                        <p>{codeResult}</p>
                    </Card>
                </div>}
            <Row style={{marginTop: "10px"}} justify="space-between">
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
        </div>
    );
}

export default Task;