import React from 'react';
import {
    Card,
    Button,
    Col,
    Row,
    PageHeader,
    Radio,
    Checkbox
} from 'antd';
import { TwitterOutlined, InstagramOutlined } from '@ant-design/icons';
import Login from './Login';

function Home(props) {

    return (
        <div>
            <PageHeader title={`Willkommen bei Robob${props.values.loggedIn ? `, ${props.values.username}` : ""}!`} />

            <p>Hier kannst Du die Grundlagen in JavaScript erlernen! Dazu hast Du die Wahl zwischen zwei Lernmethoden:</p>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Gamification" style={props.values.gameMode === 0 ? {border: '2px solid', borderColor: '#7CB6FF'} : {}}>
                        <p>Die <b>schnelle</b> Variante<br/>Zusätzlich zu üblichen Website Elementen gibt es Elemente, die man aus Videospielen kennt:</p>
                        <ul>
                            <li>Fortschrittsanzeigen</li>
                            <li>Punkte (Sterne)</li>
                            <li>Rangliste</li>
                            <li>Auszeichnungen (Mitarbeiter-Rang)</li>
                        </ul>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Serious Game" style={props.values.gameMode === 1 ? {border: '2px solid', borderColor: '#7CB6FF'} : {}}>
                        <p>Die <b>kreative</b> Variante<br/>Zusätzlich zu den Gamification Elementen, spielst du ein Spiel und hast dort weitere interessante Elemente:</p>
                        <ul>
                            <li>Spielen/Handeln als "Robob"</li>
                            <li>Interagieren mit Kollegen der "IT-Things Corp."</li>
                            <li>Entdecken der Spielwelt</li>
                            <li>Aufdecken von Geheimnissen</li>
                        </ul>
                    </Card>
                </Col>
            </Row>

            <p style={{marginTop: "10px"}}>PS: Bei beiden Varianten musst Du die gleichen Aufgaben erledigen.</p>

            {props.values.loggedIn ?
                <div>
                    <Row>
                        <Radio.Group 
                            defaultValue={props.values.gameMode} 
                            style={{ marginBot: "10px" }}
                            onChange={(event) => props.values.gameMode !== event.target.value && props.functions.setGameMode(event.target.value)}>
                            <Radio.Button value={0}>
                                Gamification
                            </Radio.Button>
                            <Radio.Button value={1}>
                                Serious Game
                            </Radio.Button>
                        </Radio.Group>
                    </Row>
                    <Checkbox checked={props.values.ignoreOptional} disabled={props.values.nextTaskWithoutOptional === 0} style={{ marginTop: "10px" }} onChange={(event) => props.functions.setIgnoreOptional(event.target.checked)} >Optionale Aufgaben ignorieren</Checkbox>
                    <br />
                    <Button style={{ marginTop: "10px" }} type="primary" href={`/task/${props.values.ignoreOptional ? props.values.nextTaskWithoutOptional : props.values.nextTaskWithOptional}`}>Nächste Aufgabe</Button>
                </div> :
                <Login values={props.values} functions={props.functions} />}

            {/* <p style={{ marginTop: '10px' }}>
                Dieses Projekt ist im Rahmen meiner Bachelor Arbeit entstanden und es würde mich freuen, wenn Du mir Feedback da lässt.
                <a target="blank" href="https://www.instagram.com/it_fenix_"><InstagramOutlined /></a>
                <a target="blank" href="https://www.twitter.com/it_fenix_"><TwitterOutlined /></a>
            </p> */}
        </div>
    );
}

export default Home;

