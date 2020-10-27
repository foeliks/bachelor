import React from 'react';
import {
    Card,
    Button,
    Col,
    Row,
    PageHeader
} from 'antd';
import { TwitterOutlined, InstagramOutlined } from '@ant-design/icons';
import Login from './Login';

function Home(props) {
    const title = `Willkommen bei Robob${props.values.loggedIn ? `, ${props.values.username}`: ""}!` ;
    return (
        <div>
            <PageHeader title={title}/>

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
            <p style={{ padding: '12px 0' }}>
                Dieses Projekt ist im Rahmen meiner Bachelor Arbeit entstanden und es würde mich freuen, wenn Du mir Feedback da lässt.
                        <a target="blank" href="https://www.instagram.com/it_fenix_"><InstagramOutlined /></a>
                <a target="blank" href="https://www.twitter.com/it_fenix_"><TwitterOutlined /></a>
            </p>
            {props.values.loggedIn ? <Button href="/categories" type="primary">Los geht's</Button> : <Login values={props.values} functions={props.functions} />}
        </div>
    );
}

export default Home;

