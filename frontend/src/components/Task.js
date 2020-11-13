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
    const [mcSelection, setMcSelection] = useState({});
    const [nextTaskWithOptional, setNextTaskWithOptional] = useState(props.values.nextTaskWithOptional);
    const [nextTaskWithoutOptional, setNextTaskWithoutOptional] = useState(props.values.nextTaskWithoutOptional);

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
                            setTask(json)
                            if (json.specify && json.specify.type === "multiple_choice") {
                                let newMcSelection = {};
                                json.specify.options.map(option => {
                                    newMcSelection[option.id] = false;
                                })
                                setMcSelection(newMcSelection)
                            }
                            else if(json.specify && json.specify.type === "code") {
                                setTextarea(json.specify.placeholder_middle)
                            }
                        })
                }
            })
            .catch(error => console.error(error))
        

    }, [taskId])

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
                    "user_solution": task.specify.type === "code" ? task.specify.placeholder_before + '\n' + textarea + '\n' + task.specify.placeholder_after : codeResult
                        

                })
            })
                .then(res => {
                    if (res.status === 202) {
                        setSuccess(true);
                        res.json().then(json => {
                            setTask({ ...task, stars: json.stars })
                            setNextTaskWithOptional(json.task_with_optional);
                            setNextTaskWithoutOptional(json.task_without_optional);
                        })
                    }
                    else if (res.status === 200) {
                        res.json().then(json => {
                            setTask({ ...task, tries: json.tries })
                        })
                        setSubmitted(false)
                    }
                    else {
                        props.functions.logOut();
                    }
                })
                .catch(error => console.error(error))
        }
    }, [codeResult, submitted, textarea, task])

    const submit = () => {
        if (task.specify) {
            if (task.specify.type === "code") {

                let userSolution = "";
                const completeCode = task.specify.placeholder_before + '\n' + textarea + '\n' + task.specify.placeholder_after;
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
            else if (task.specify.type === "multiple_choice") {
                setCodeResult(JSON.stringify(mcSelection));
            }
        }
    }

    const successScreen = () => {
        return (
            <Card style={{ backgroundColor: 'green' }}>
                <h1>Geschafft!</h1>
                <Checkbox disabled={nextTaskWithoutOptional === 0} style={{ marginTop: "20px" }} onChange={(event) => setIgnoreOptional(event.target.checked)} >Optionale Aufgaben ignorieren</Checkbox>
                <br />
                <Button style={{ marginTop: "10px" }} type="primary" href={`/task/${ignoreOptional ? nextTaskWithoutOptional : nextTaskWithOptional}`}>Fortsetzen</Button>
            </Card>
        )
    }

    const knowledgeBody =
        <Collapse defaultActiveKey="1" style={{ marginBottom: "10px" }}>
            <Collapse.Panel key="1" header="Info">
                <div dangerouslySetInnerHTML={{ __html: task.knowledge }} />
                <p style={{ marginTop: "10px", color: "grey" }}>PS: Du kannst alle Infos auch nochmal im <a href="/diary">Tagebuch</a> nachlesen</p>
            </Collapse.Panel>
        </Collapse>

    const codeBody = () => {
        return (<div>
            <Card style={
                hackerMode ? {
                    color: 'green',
                    backgroundColor: 'black',
                    fontFamily: 'Hack'
                } : { fontFamily: 'Hack' }}>
                <p>{task.specify.placeholder_before}</p>
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
                    defaultValue={task.specify.placeholder_middle ? task.specify.placeholder_middle : ""}
                    onChange={() => setTextarea(document.getElementById("textarea").value)}
                    autoFocus
                    spellCheck={false}
                    id="textarea"
                    rows={5} />

                <p>{task.specify.placeholder_after}</p>
            </Card>
            <Card title="Ausgabe" style={codeFailed ? { backgroundColor: 'red', marginTop: "10px" } : { marginTop: "10px" }}>
                <p>{codeResult}</p>
            </Card>
        </div>)
    }

    const multipleChoiceBody = () => {
        const result =
            <Card>
                {task.specify.options.map(option => {
                    return (<Checkbox id={option.id} onChange={event => setMcSelection({ ...mcSelection, [event.target.id]: event.target.checked })}>
                        {option.text}
                    </Checkbox>)
                })}
            </Card>;
        return result;
    }

    return (
        <div>
            <Row justify="space-between" align="middle">
                <PageHeader
                    title={`Aufgabe ${task.id} ${task.optional ? " (optional)" : ""}`}
                    onBack={() => history.goBack()}
                />
                Fehlversuche: {task.tries ? task.tries : 0}
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
            {task.specify && (
                task.specify.type === "multiple_choice" ? multipleChoiceBody() :
                    task.specify.type === "code" && codeBody())}
            <Row style={{ marginTop: "10px" }} justify="space-between">
                <Col>
                    <Button
                        type="primary"
                        onClick={() => {
                            submit();
                            setSubmitted(true);
                        }}>Bestätigen</Button>
                </Col>
                {task.specify && task.specify.type === "code" && <Col >
                    <label >Hacker-Mode </label>
                    <Switch style={{ flexDirection: 'row', justifyContent: 'flex-end' }} onChange={(checked) => {
                        setHackerMode(checked);
                        document.getElementById("textarea").value = textarea;
                    }} />
                </Col>}
            </Row>
            {success ? successScreen() : <div />}
        </div>);
}

export default Task;