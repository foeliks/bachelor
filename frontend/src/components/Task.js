import React, { useEffect, useState } from 'react';
import { useParams, useHistory, Prompt } from 'react-router-dom';
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
    Spin,
    Select
} from 'antd';
import {
    StarOutlined,
    StarFilled,
    LoadingOutlined
} from '@ant-design/icons';
import Unity, { UnityContent } from "react-unity-webgl";

const unityContent = new UnityContent(
    "/Build/game.json",
    "/Build/UnityLoader.js"
)

function Task(props) {
    const { id } = useParams();
    const history = useHistory();
    const ref = React.createRef();

    const [taskId, setTaskId] = useState(id);
    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState({});
    const [hackerMode, setHackerMode] = useState(false);
    const [textarea, setTextarea] = useState("");
    const [codeFailed, setCodeFailed] = useState(false);
    const [codeResult, setCodeResult] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [success, setSuccess] = useState([]);
    const [wrongAnswer, setWrongAnswer] = useState(false);
    const [selection, setSelection] = useState({});
    const [nextTaskWithOptional, setNextTaskWithOptional] = useState(props.values.nextTaskWithOptional);
    const [nextTaskWithoutOptional, setNextTaskWithoutOptional] = useState(props.values.nextTaskWithoutOptional);


    const [progress, setProgress] = useState(props.values.progress);

    // States für Unity Interaction
    const [test, setTest] = useState("");
    const [active, setActive] = useState(props.values.gameMode === 0 ? true : false)

    useEffect(() => {
        unityContent.on("test", message => setTest(message))
        unityContent.on("activateTask", (id) => {
            setTaskId(id);
            setActive(true);
        })
        unityContent.on("deactivateTask", () => {
            setActive(false);
        })
        unityContent.on("loaded", () => unityContent.send("EventSystem", "setInputJson", JSON.stringify(props.values.progress)))
    }, [])

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
                            if (json.specify && json.type === "multiple_choice") {
                                let newSelection = {};
                                json.specify.options.map(option => {
                                    newSelection[option.id] = false;
                                })
                                setSelection(newSelection)
                            }
                            else if (json.specify && json.type === "code") {
                                setTextarea(json.specify.placeholder_middle)
                            }
                        })
                        .then(setLoading(false))
                }
            })
            .catch(error => console.error(error))
    }, [taskId])

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
                    "user_solution": task.type === "code" ? task.specify.placeholder_before + '\n' + textarea + '\n' + task.specify.placeholder_after : codeResult


                })
            })
                .then(res => {
                    if (res.status === 202) {
                        setSuccess((oldSucess) => [...oldSucess, taskId]);
                        setWrongAnswer(false);
                        setSubmitted(false);
                        res.json().then(json => {
                            setTask({ ...task, solved_stars: json.solved_stars })
                            setNextTaskWithOptional(json.task_with_optional);
                            setNextTaskWithoutOptional(json.task_without_optional);
                        })
                        fetch('http://localhost:8000/robob/actual-progress', {
                            headers: {
                                Authorization: `JWT ${localStorage.getItem('token')}`
                            }
                        })
                            .then(res => {
                                if (res.status !== 200) {
                                    props.functions.logOut();
                                }
                                else {
                                    res.json()
                                        .then(json => {
                                            setProgress(json);
                                            unityContent.send("EventSystem", "setInputJson", JSON.stringify(json))
                                        })
                                }
                            })
                            .catch(error => console.error(error))
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
        if (success.some((id) => id === taskId) && ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }

    }, [submitted])

    const submit = () => {
        if (task.specify) {
            if (task.type === "code") {

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
            else if (task.type === "multiple_choice" || task.type === "select" || task.type === "input") {
                setCodeResult(JSON.stringify(selection));
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
            : success.some((id) => id === taskId) && {
                border: '2px solid',
                borderColor: props.values.robobGreen
            }

    const codeFailedStyle = () => codeFailed && {
        border: '2px solid',
        borderColor: 'red'
    }

    if (!((task.required_employee_rank && props.values.employeeRank.id < task.required_employee_rank.id) ||
        (task.achieve_employee_rank && !props.functions.solvedNeededTasks(task.category_id)) ||
        (task.required_stars && props.values.sumStars < task.required_stars))) {
        return (
            <div>
                <Prompt when={props.values.progress !== progress} message="Dein Fortschritt wurde noch nicht gespeichert!" />

                {props.values.gameMode === 1 ?
                    <PageHeader
                        title={"Robob"} onBack={() => history.push('/overview')} />
                    : <Row justify="space-between" align="middle">
                        {props.values.gameMode === 1 ?
                            <PageHeader title={`Aufgabe ${task.id ? task.id : ""} ${task.optional ? " (optional)" : ""}`} />
                            : <PageHeader
                                title={`Aufgabe ${task.id ? task.id : ""} ${task.optional ? " (optional)" : ""}`}
                                onBack={() => history.push('/overview')} />}
                        Fehlversuche: {task.tries ? task.tries : 0}
                        {task.stars > 0 ? <div>
                            {task.stars === 3 ? <StarFilled /> : <StarOutlined />}
                            {task.stars >= 2 ? <StarFilled /> : <StarOutlined />}
                            <StarFilled />
                        </div> : <div />}
                    </Row>}


                {loading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ display: 'flex', justifyContent: 'center' }} />
                    : props.values.gameMode === 1 &&
                    <div>
                        <Unity unityContent={unityContent} />
                    </div>}


                {active && <div>

                    {props.values.gameMode === 1 &&
                        <Row justify="space-between" align="middle">
                            {props.values.gameMode === 1 ?
                                <PageHeader title={`Aufgabe ${task.id ? task.id : ""} ${task.optional ? " (optional)" : ""}`} />
                                : <PageHeader
                                    title={`Aufgabe ${task.id ? task.id : ""} ${task.optional ? " (optional)" : ""}`}
                                    onBack={() => history.push('/overview')} />}
                            Fehlversuche: {task.tries ? task.tries : 0}
                            {task.stars > 0 ? <div>
                                {task.stars === 3 ? <StarFilled /> : <StarOutlined />}
                                {task.stars >= 2 ? <StarFilled /> : <StarOutlined />}
                                <StarFilled />
                            </div> : <div />}
                        </Row>}

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
                        task.type === "input" ?
                            <Card style={{ ...answerStyle() }} >
                                {task.specify.inputs.map(input => {
                                    return (
                                        <Input
                                            addonBefore={input.label}
                                            disabled={success.some((id) => id === taskId)}
                                            autoFocus
                                            spellCheck={false}
                                            placeholder={input.placeholder}
                                            onChange={() => setSelection({ ...selection, [input.id]: document.getElementById(`input ${input.id}`).value })}
                                            id={`input ${input.id}`} />)
                                })}
                            </Card>

                            : task.type === "select" ?
                                <Card style={{ ...answerStyle() }}>
                                    {task.specify.selects.map(select => {
                                        return (
                                            <div>
                                                <label>{select.label} </label>
                                                <Select key={select.id} disabled={success.some((id) => id === taskId)} defaultValue="Auswählen" onSelect={value => setSelection({ ...selection, [select.id]: value })}>
                                                    {select.options.map(option => {
                                                        return (
                                                            <Select.Option value={option}>{option}</Select.Option>
                                                        )
                                                    })}
                                                </Select>
                                            </div>)
                                    })}
                                </Card>
                                : task.type === "multiple_choice" ?
                                    <Card style={{ ...answerStyle() }}>
                                        {task.specify.options.map(option => {
                                            return (<Checkbox disabled={success.some((id) => id === taskId)} id={option.id} onChange={event => setSelection({ ...selection, [event.target.id]: event.target.checked })}>
                                                {option.text}
                                            </Checkbox>)
                                        })}
                                    </Card>


                                    : task.type === "code" &&
                                    <div>
                                        <Card title="Code-Eingabe" headStyle={{ ...hackerStyle() }} style={{ ...hackerStyle(), ...answerStyle() }}>
                                            <p style={{ fontFamily: 'Hack' }} >{task.specify.placeholder_before}</p>
                                            <Input.TextArea
                                                disabled={success.some((id) => id === taskId)}
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
                                disabled={success.some((id) => id === taskId)}
                                type="primary"
                                onClick={() => {
                                    setSubmitted(true);
                                    submit();
                                }}>Bestätigen</Button>
                        </Col>
                        {task.specify && task.type === "code" && <Col >
                            <label >Hacker-Mode </label>
                            <Switch style={{ flexDirection: 'row', justifyContent: 'flex-end' }} onChange={(checked) => {
                                setHackerMode(checked);
                                document.getElementById("textarea").value = textarea;
                            }} />
                        </Col>}
                    </Row>


                    {success.some((id) => id === taskId) ?
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
            <Card title="Hoppla" style={{ marginTop: "10px", border: '2px solid', borderColor: 'red' }} >
                {loading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ display: 'flex', justifyContent: 'center' }} /> :
                    (task.required_employee_rank && props.values.employeeRank.id < task.required_employee_rank.id) ?
                        <p>
                            Für diese Aufgabe benötigst du einen höheren Mitarbeiter Rang!
                            <br />
                            Du bist bisher {props.values.employeeRank.title ? props.values.employeeRank.title : "Ranglos"} und musst mindestens {task.required_employee_rank.title} sein.
                            <br />
                            Um einen höheren Rang zu erreichen, erledige die letzten Aufgaben in den jeweiligen Kapiteln
                        </p>
                        : (task.achieve_employee_rank && !props.functions.solvedNeededTasks(task.category_id)) ?
                            <p>
                                Für diese Aufgabe musst du erst die Pflicht-Aufgaben dieses Kapitels erledigen!
                        </p>
                            : (task.required_stars && props.values.sumStars < task.required_stars) &&
                            <p>
                                Für diese Aufgabe hast Du doch nicht genug Sterne gesammelt!
                            <br />
                            Du hast bisher {props.values.sumStars ? props.values.sumStars : 0} und benötigst mindestens {task.required_stars}.
                            <br />
                            Entweder du versuchst deine bisherigen Bewertungen zu verbessern oder du bearbeitest die optionalen Aufgaben.
                        </p>}
            </Card>
        </div>)
}

export default Task;
