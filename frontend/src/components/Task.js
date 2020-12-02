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
    const [success, setSuccess] = useState(false);
    const [wrongAnswer, setWrongAnswer] = useState(false);
    const [selection, setSelection] = useState({});
    const [nextTaskWithOptional, setNextTaskWithOptional] = useState(props.values.nextTaskWithOptional);
    const [nextTaskWithoutOptional, setNextTaskWithoutOptional] = useState(props.values.nextTaskWithoutOptional);

    // States für Unity Interaction
    const [test, setTest] = useState("");
    const [active, setActive] = useState(props.values.gameMode === 0 ? true : false)

    useEffect(() => {
        unityContent.on("test", message => setTest(message))
        unityContent.on("activateTask", (id) => {
            setTaskId(id);
            setActive(true)
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
                            if (json.specify && json.specify.type === "multiple_choice") {
                                let newSelection = {};
                                json.specify.options.map(option => {
                                    newSelection[option.id] = false;
                                })
                                setSelection(newSelection)
                            }
                            else if (json.specify && json.specify.type === "code") {
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
            else if (task.specify.type === "multiple_choice" || task.specify.type === "select" || task.specify.type === "input") {
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
            : success && {
                border: '2px solid',
                borderColor: props.values.robobGreen
            }

    const codeFailedStyle = () => codeFailed && {
        border: '2px solid',
        borderColor: 'red'
    }

    const taskHeader = (
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
        </Row>)

    if (!((task.required_employee_rank && props.values.employeeRank.id < task.required_employee_rank.id) ||
        (task.achieve_employee_rank && !props.functions.solvedNeededTasks(task.category_id)) ||
        (task.required_stars && props.values.sumStars < task.required_stars))) {
        return (
            <div>
                {props.values.gameMode === 1 ?
                    <PageHeader
                        title={"Robob"} onBack={() => history.push('/overview')} />
                    : taskHeader}


                {loading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ display: 'flex', justifyContent: 'center' }} />
                    : props.values.gameMode === 1 &&
                    <div>
                        <Unity unityContent={unityContent} />
                    </div>}


                {active && <div>

                    {props.values.gameMode === 1 && taskHeader}

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
                        task.specify.type === "input" ?
                            <Card style={{ ...answerStyle() }} >
                                {task.specify.inputs.map(input => {
                                    return (
                                        <Input
                                            addonBefore={input.label}
                                            disabled={success}
                                            autoFocus
                                            spellCheck={false}
                                            placeholder={input.placeholder}
                                            onChange={() => setSelection({ ...selection, [input.id]: document.getElementById(`input ${input.id}`).value })}
                                            id={`input ${input.id}`} />)
                                })}
                            </Card>

                            : task.specify.type === "select" ?
                                <Card style={{ ...answerStyle() }}>
                                    {task.specify.selects.map(select => {
                                        return (
                                            <div>
                                                <label>{select.label} </label>
                                                <Select key={select.id} disabled={success} defaultValue="Auswählen" onSelect={value => setSelection({ ...selection, [select.id]: value })}>
                                                    {select.options.map(option => {
                                                        return (
                                                            <Select.Option value={option}>{option}</Select.Option>
                                                        )
                                                    })}
                                                </Select>
                                            </div>)
                                    })}
                                </Card>
                                : task.specify.type === "multiple_choice" ?
                                    <Card style={{ ...answerStyle() }}>
                                        {task.specify.options.map(option => {
                                            return (<Checkbox disabled={success} id={option.id} onChange={event => setSelection({ ...selection, [event.target.id]: event.target.checked })}>
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



// {"sum_stars":0,"employee_rank":{"id":1,"title":"Praktikant"},"categories":[{"id":1,"title":"Einführung","progress":0,"tasks":[{"id":1,"category_id":1,"optional":false,"solved":false,"stars":0,"required_stars":null,"required_employee_rank":null,"achieve_employee_rank":null},{"id":2,"category_id":1,"optional":false,"solved":false,"stars":0,"required_stars":null,"required_employee_rank":null,"achieve_employee_rank":null},{"id":3,"category_id":1,"optional":false,"solved":false,"stars":0,"required_stars":null,"required_employee_rank":null,"achieve_employee_rank":null},{"id":4,"category_id":1,"optional":true,"solved":false,"stars":0,"required_stars":null,"required_employee_rank":null,"achieve_employee_rank":null},{"id":5,"category_id":1,"optional":true,"solved":false,"stars":0,"required_stars":null,"required_employee_rank":null,"achieve_employee_rank":null},{"id":6,"category_id":1,"optional":false,"solved":false,"stars":0,"required_stars":9,"required_employee_rank":null,"achieve_employee_rank":{"id":1,"title":"Praktikant"}}]},{"id":2,"title":"Primitive Datentypen","progress":0,"tasks":[{"id":7,"category_id":2,"optional":false,"solved":false,"stars":0,"required_stars":null,"required_employee_rank":{"id":1,"title":"Praktikant"},"achieve_employee_rank":null},{"id":8,"category_id":2,"optional":false,"solved":false,"stars":0,"required_stars":null,"required_employee_rank":{"id":1,"title":"Praktikant"},"achieve_employee_rank":null}]},{"id":3,"title":"Variablen","progress":100,"tasks":[]},{"id":4,"title":"Kontrollstrukturen","progress":100,"tasks":[]},{"id":5,"title":"Komplexe Datentypen","progress":100,"tasks":[]}],"diary":[{"id":1,"title":"Einführung","knowledge":[{"id":1,"description":"<p>JavaScript ist...</p><ul><li>Dynamisch typisiert<dl><dd>Variablen können unterschiedliche Datentypen aufnehmen</dd></dl></li><li>Objektorientiert<dl><dd>Es gibt Objekte, Vererbung, Polymorphie</dd></dl></li><li>Prototypen-basiert<dl><dd>Objekte werden über Prototypen konstriert</dd></dl></li></ul>"},{"id":2,"description":"<p>JavaScript kann in HTML über drei Möglichkeiten eingebunden werden:</p><ol><li>In externen Dateien im Header<dl><dd>&lt;script src=\"Dateiname.js\" /&gt;</dd></dl></li><li>Einbettung im Dokument an beliebiger Stelle<dl><dd>&lt;script type=\"text/javascript\"&gt; <i>JavaScript Code</i> &lt;/script&gt;</dd><dd><br/>Code wird sofort ausgeführt, wenn der Webbrowser die Stelle einliest. Es kann also sein, dass Elemente, die \"weiter unten\" im Dokument noch nicht ansprechbar sind <br />deshalb: Am Ende des &lt;body&gt; Tags einfügen\t</dd></dl></li><li>In speziellen Attributen in HTML-Elementen als Aktionen<dl><dd>&lt;button onclick=\" <i>JavaScript Code</i> \"&gt;Cooler Buttonname&lt;/button&gt;</dd></dl></li></ol>"},{"id":3,"description":"<p>Kommentare können wie in anderen Programmiersprachen mittels ...</p><ul><li>// Einzeiliger Kommentar</li><li>/*<br/>Mehrzeiliger <br/>Kommentar <br/>*/</li></ul><p>... eingefügt werden</p>"},{"id":4,"description":"<p>Eine Ausgabe von Inhalten kann auf zwei Weisen erfolgen:</p><ol><li>alert: Gibt eine PopUp-Meldung in Form eines Dialogfensters im Webbrowser aus</li><li>console: Gibt Nachrichten in der Entwicklerkonsole des Webbrowsers aus<ul><li>.log() </br>Nachricht wird ohne weiteres Highlighting ausgegeben</li><li>.warn() </br>Nachricht wird als Warnung (häufig gelb) ausgegeben</li><li>.error() </br>Nachricht wird als Fehler (häufig rot) ausgegeben</li></ul></li></ol>"},{"id":5,"description":"<p>Es gibt einen \"Strict Mode\", der ...</p><ul><li>Fehler meldet, sobald z.B. auf nicht deklarierte Variablen zugegriffen wird</li><li>Dich vor Fehlern bewahrt, die schwer zu finden sein können</li><li>Über \"use strict\"; in der ersten Zeile des Codes aktiviert wird<br/>(Du musst diesen nicht selbst aktivieren, das hat der nette Entwickler dieser Lernumgebung schon für dich gemacht)</li></ul>"}]},{"id":2,"title":"Primitive Datentypen","knowledge":[{"id":6,"description":"<p>JavaScript kennt die folgenden&nbsp;<strong>primitiven Darentypen</strong>:</p><ul><li><strong>string&nbsp;</strong>(Zeichenketten)</li><li><strong>number&nbsp;</strong>(Zahlenwerte)</li><li><strong>boolean</strong> (wahr | falsch)</li></ul><p>Spezielle Werte:</p><ul><li><strong>null</strong> (Kein Wert)</li><li><strong>undefined</strong> (Nicht definierter Wert)</li></ul>"},{"id":7,"description":"<p><strong>Operatoren</strong></p><table ><tbody><tr><td style=\"background-color: grey; color: white;\">Operator</td><td style=\"background-color: grey; color: white;\">Beschreibung</td><td style=\"background-color: grey; color: white;\">Operator und Zuweisung</td></tr><tr><td>+</td><td>Addition</td><td>x += y</td></tr><tr><td>-</td><td>Subtraktion</td><td>x -= y</td></tr><tr><td>*</td><td>Multiplikation</td><td><p>x *= y</p></td></tr><tr><td>&nbsp;/</td><td>Division</td><td><p>x /= y</p></td></tr><tr><td>%</td><td>Modulo</td><td>x %= y</td></tr><tr><td>++</td><td>Inkrement</td><td>&nbsp;</td></tr><tr><td>--</td><td>Dekrement</td><td>&nbsp;</td></tr></tbody></table>"}]},{"id":3,"title":"Variablen","knowledge":[]},{"id":4,"title":"Kontrollstrukturen","knowledge":[]},{"id":5,"title":"Komplexe Datentypen","knowledge":[]}]}