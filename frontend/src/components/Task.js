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
    Checkbox,
    Spin
} from 'antd';
import {
    StarOutlined,
    StarFilled,
    LoadingOutlined
} from '@ant-design/icons';
import Unity, { UnityContext } from "react-unity-webgl";

function Task(props) {
    const { taskId } = useParams();
    const history = useHistory();
    const ref = React.createRef();
    const unityContext = new UnityContext({
        loaderUrl: "build/game.loader.js",
        dataUrl: "build/game.data",
        frameworkUrl: "build/game.framework.js",
        codeUrl: "build/game.wasm",
      });

    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState({});
    const [hackerMode, setHackerMode] = useState(false);
    const [textarea, setTextarea] = useState("");
    const [codeFailed, setCodeFailed] = useState(false);
    const [codeResult, setCodeResult] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [success, setSuccess] = useState(false);
    const [wrongAnswer, setWrongAnswer] = useState(false);
    const [mcSelection, setMcSelection] = useState({});
    const [nextTaskWithOptional, setNextTaskWithOptional] = useState(props.values.nextTaskWithOptional);
    const [nextTaskWithoutOptional, setNextTaskWithoutOptional] = useState(props.values.nextTaskWithoutOptional);
    
    // Test States für Unity Interaction
    const [test, setTest] = useState("");

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
                            else if (json.specify && json.specify.type === "code") {
                                setTextarea(json.specify.placeholder_middle)
                            }
                        })
                        .then(setLoading(false))
                }
            })
            .catch(error => console.error(error))

        unityContext.on("test", message => setTest(message))
    }, [])

    useEffect(() => {
        if (submitted) {

            fetch(`http://localhost:8000/robob/task/${taskId}`, {
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
                        setWrongAnswer(false);
                        setSubmitted(false);
                        res.json().then(json => {
                            setTask({ ...task, solved_stars: json.solved_stars })
                            setNextTaskWithOptional(json.task_with_optional);
                            setNextTaskWithoutOptional(json.task_without_optional);
                        })
                    }
                    else if (res.status === 200) {
                        setWrongAnswer(true);
                        setSubmitted(false);
                        res.json().then(json => {
                            setTask({ ...task, tries: json.tries })
                        })
                    }
                    else {
                        props.functions.logOut();
                    }
                })
                .catch(error => console.error(error))
        }
        if (success && ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }

    }, [submitted])

    const submit = () => {
        if (task.specify) {
            if (task.specify.type === "code") {

                let userSolution = "";
                const completeCode = '"use strict";\n' + task.specify.placeholder_before + '\n' + textarea + '\n' + task.specify.placeholder_after;
                try {
                    const runCode = new Function(completeCode);
                    const result = runCode()
                    userSolution = result === undefined ? "" : String(result);
                    setCodeFailed(false);
                }
                catch (error) {
                    userSolution = "Error: " + error.message;
                    setCodeFailed(true);
                }
                setCodeResult(userSolution);
            }
            else if (task.specify.type === "multiple_choice") {
                setCodeResult(JSON.stringify(mcSelection));
            }
        }
    }

    const hackerStyle = () => hackerMode && {
        color: 'green',
        backgroundColor: 'black'
    }

    const answerStyle = () => submitted ? {}
        : wrongAnswer ? {
            border: '2px solid',
            borderColor: 'red'
        }
            : success && {
                border: '2px solid',
                borderColor: props.values.robobGreen
            }

    const codeFailedStyle = () => codeFailed && {
        border: '2px solid',
        borderColor: 'red'
    }

    if ((task.required_employee_rank && props.values.employeeRank < task.required_stars) || (!task.required_stars || task.required_stars < props.values.sumStars)) {
        return (
            <div>
                <Row justify="space-between" align="middle">
                    <PageHeader
                        title={`Aufgabe ${task.id ? task.id : ""} ${task.optional ? " (optional)" : ""}`}
                        onBack={() => history.push('/overview')}
                    />
                Fehlversuche: {task.tries ? task.tries : 0}
                    {task.stars > 0 ? <div>
                        {task.stars === 3 ? <StarFilled /> : <StarOutlined />}
                        {task.stars >= 2 ? <StarFilled /> : <StarOutlined />}
                        <StarFilled />
                    </div> : <div />}
                </Row>

                {loading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ display: 'flex', justifyContent: 'center' }} />
                    : props.values.gameMode === 1
                        ? 
                        <div>
                            <Unity unityContext={unityContext} />
                            <Button onClick={() => unityContext.send('JavaScriptHook', 'TintRed')}>ROT</Button>
                            <Button onClick={() => unityContext.send('JavaScriptHook', 'TintGreen')}>GRÜN</Button>
                            <p>Nachricht von Unity: {test}</p>
                        </div>
                        : props.values.gameMode === 0 && <div>
                            <Card title="Aufgabenstellung" style={{ marginBottom: "10px" }}>
                                <div dangerouslySetInnerHTML={{ __html: task.description }} />
                            </Card>


                            {task.knowledge &&
                                <Collapse defaultActiveKey="1" style={{ marginBottom: "10px" }}>
                                    <Collapse.Panel key="1" header="Info">
                                        <div dangerouslySetInnerHTML={{ __html: task.knowledge }} />
                                        <p style={{ marginTop: "10px", color: "grey" }}>PS: Du kannst alle Infos auch nochmal im <a href="/diary">Tagebuch</a> nachlesen</p>
                                    </Collapse.Panel>
                                </Collapse>}


                            {task.specify && (
                                task.specify.type === "multiple_choice" ?
                                    <Card style={{ ...answerStyle() }}>
                                        {task.specify.options.map(option => {
                                            return (<Checkbox disabled={success} id={option.id} onChange={event => setMcSelection({ ...mcSelection, [event.target.id]: event.target.checked })}>
                                                {option.text}
                                            </Checkbox>)
                                        })}
                                    </Card>


                                    : task.specify.type === "code" &&
                                    <div>
                                        <Card title="Code-Eingabe" headStyle={{ ...hackerStyle() }} style={{ ...hackerStyle(), ...answerStyle() }}>
                                            <p style={{ fontFamily: 'Hack' }} >{task.specify.placeholder_before}</p>
                                            <Input.TextArea
                                                disabled={success}
                                                style={{ fontFamily: 'Hack', ...hackerStyle() }}
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

                                            <p style={{ fontFamily: 'Hack' }}>{task.specify.placeholder_after}</p>
                                        </Card>


                                        <Card title="Ausgabe" headStyle={{ ...hackerStyle() }} style={{ marginTop: "10px", ...codeFailedStyle(), ...hackerStyle() }} >
                                            <p style={{ fontFamily: 'Hack' }}>{codeResult}</p>
                                        </Card>
                                    </div>)}


                            <Row style={{ marginTop: "10px" }} justify="space-between">
                                <Col>
                                    <Button
                                        disabled={success}
                                        type="primary"
                                        onClick={() => {
                                            setSubmitted(true);
                                            submit();
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

                            {success ?
                                <Card style={{ backgroundColor: props.values.robobGreen, marginTop: "10px" }}>
                                    <h1 style={{ color: "white" }}>Geschafft!</h1>
                                    {task.solved_stars > 0 ? <div>
                                        {task.solved_stars === 3 ? <StarFilled style={{ color: "yellow" }} /> : <StarOutlined />}
                                        {task.solved_stars >= 2 ? <StarFilled style={{ color: "yellow" }} /> : <StarOutlined />}
                                        <StarFilled style={{ color: "yellow" }} />
                                    </div> : <div />}
                                    {task.achieve_employee_rank && task.achieve_employee_rank.id > props.values.employeeRank.id &&
                                        <p>Herzlichen Glückwunsch, du bist jetzt ein {task.achieve_employee_rank.title}</p>}
                                    <Checkbox checked={props.values.ignoreOptional} disabled={nextTaskWithoutOptional === 0} style={{ marginTop: "20px", color: "white" }} onChange={(event) => props.functions.setIgnoreOptional(event.target.checked)} >Optionale Aufgaben ignorieren</Checkbox>
                                    <br />
                                    <Button style={{ marginTop: "10px" }} type="primary" href={`/task/${props.values.ignoreOptional ? nextTaskWithoutOptional : nextTaskWithOptional}`}>Ergebnis speichern & Fortsetzen</Button>
                                </Card>
                                : <div />}
                            <div ref={ref} />
                        </div>}
            </div>);
    }


    return (
        <div>
            <PageHeader
                title={`Aufgabe ${task.id ? task.id : ""} ${task.optional ? " (optional)" : ""}`}
                onBack={() => history.push('/overview')}
            />
            {loading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ display: 'flex', justifyContent: 'center' }} /> :
                (task.required_employee_rank && props.values.employeeRank.id < task.required_employee_rank.id) ?
                    <Card title="Hoppla" style={{ marginTop: "10px", border: '2px solid', borderColor: 'red' }} >
                        <p>
                            Für diese Aufgabe benötigst du einen höheren Mitarbeiter Rang!
                    <br />
                    Du bist bisher {props.values.employeeRank.title ? props.values.employeeRank.title : "Ranglos"} und musst mindestens {task.required_employee_rank.title} sein.
                    <br />
                    Um einen höheren Rang zu erreichen, erledige die letzten Aufgaben in den jeweiligen Kapiteln
                </p>
                    </Card>
                    : (task.required_stars && props.values.sumStars < task.required_stars) && <Card title="Hoppla" style={{ marginTop: "10px", border: '2px solid', borderColor: 'red' }} >
                        <p>
                            Für diese Aufgabe hast Du doch nicht genug Sterne gesammelt!
                    <br />
                    Du hast bisher {props.values.sumStars ? props.values.sumStars : 0} und benötigst mindestens {task.required_stars}.
                    <br />
                    Entweder du versuchst deine bisherigen Bewertungen zu verbessern oder du bearbeitest die optionalen Aufgaben.
                </p>
                    </Card>}
        </div>)
}

export default Task;