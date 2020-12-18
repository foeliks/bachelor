import React from 'react';
import { useHistory } from 'react-router-dom';
import { PageHeader, Card } from 'antd';

function FinishedBody(props) {
    const history = useHistory();
    return (
        <div>
            <PageHeader
                title={`Aufgabe ${props.values.task && props.values.task.id ? props.values.task.id : ""} ${props.values.task && props.values.task.optional ? " (optional)" : ""}`}
                onBack={() => history.push('/overview')}
            />
            <Card title="Hoppla" style={{ marginTop: "10px", border: '2px solid', borderColor: 'red' }} >
                {(props.values.task && props.values.task.required_employee_rank && props.values.employeeRank.id < props.values.task.required_employee_rank.id) ?
                        <p>
                            Für diese Aufgabe benötigst du einen höheren Mitarbeiter Rang!
                            <br />
                            Du bist bisher {props.values.employeeRank.title ? props.values.employeeRank.title : "Ranglos"} und musst mindestens {props.values.task.required_employee_rank.title} sein.
                            <br />
                            Um einen höheren Rang zu erreichen, erledige die letzten Aufgaben in den jeweiligen Kapiteln
                        </p>
                        : (props.values.task && props.values.task.achieve_employee_rank && !props.functions.solvedNeededTasks(props.values.task.category_id)) ?
                            <p>
                                Für diese Aufgabe musst du erst die Pflicht-Aufgaben dieses Kapitels erledigen!
                            </p>
                        : (props.values.task && props.values.task.required_stars && props.values.sumStars < props.values.task.required_stars) ?
                            <p>
                                Für diese Aufgabe hast Du doch nicht genug Sterne gesammelt!
                            <br />
                            Du hast bisher {props.values.sumStars ? props.values.sumStars : 0} und benötigst mindestens {props.values.task.required_stars}.
                            <br />
                            Entweder du versuchst deine bisherigen Bewertungen zu verbessern oder du bearbeitest die optionalen Aufgaben.
                            </p>
                        : <p>Hier gibt es keine Aufgabe für dich!</p>}
            </Card>
        </div>)
}



export default FinishedBody;
