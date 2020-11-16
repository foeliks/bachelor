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

            <p>
                Hier kannst Du die Grundlagen in JavaScript erlernen! Dazu hast Du die Wahl zwischen zwei Lernmethoden:
            </p>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Serious Game">
                        <ul>
                            <li>sinnvolle Info</li>
                        </ul>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Gamification">
                        <ul>
                            <li>sinnvolle Info</li>
                        </ul>
                    </Card>
                </Col>
            </Row>

            {props.values.loggedIn ?
                <div>
                    <Row>
                        <Radio.Group defaultValue={props.values.gameMode} style={{ marginTop: "10px" }}
                            onChange={(event) => props.values.gameMode !== event.target.value && props.functions.setGameMode(event.target.value)}>
                            <Radio value={1}>
                                Serious Game
                            </Radio>
                            <Radio value={0}>
                                Gamification
                            </Radio>
                        </Radio.Group>
                    </Row>
                    <Checkbox disabled={props.values.nextTaskWithoutOptional === 0} style={{ marginTop: "10px" }} onChange={(event) => props.functions.setIgnoreOptional(event.target.checked)} >Optionale Aufgaben ignorieren</Checkbox>
                    <br />
                    <Button style={{ marginTop: "10px" }} type="primary" href={`/task/${props.values.ignoreOptional ? props.values.nextTaskWithoutOptional : props.values.nextTaskWithOptional}`}>Fortsetzen</Button>
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

