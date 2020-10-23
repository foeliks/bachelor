import React from 'react';
import {
    Layout,
    PageHeader,
    Card,
    Button,
    Col,
    Row
} from 'antd';
import {TwitterOutlined, InstagramOutlined} from '@ant-design/icons';

function Home() {
    return (
        <Layout>
            <Layout.Content style={
                {padding: '0 50px'}
            }>
                <PageHeader className="site-page-header" title="Robob"/>

                <p>
                    Dies ist eine Lernplattform, mit der Du die Grundlagen in JavaScript erlernen kannst. Dazu hast Du die Wahl zwischen zwei Lernmethoden:
                </p>

                    <Row gutter={16}>

                        <Col span={12}>
                            <Card title="Serious Game"></Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Gamification"></Card>
                        </Col>

                    </Row>
                    <p>
                        Dieses Projekt ist im Rahmen meiner Bachelor Arbeit entstanden und es würde mich freuen, wenn Du mir Feedback da lässt.
                        <a target="blank" href="https://www.instagram.com/it_fenix_"><InstagramOutlined/></a>
                        <a target="blank" href="https://www.twitter.com/it_fenix_"><TwitterOutlined/></a>
                    </p>
                <Button href="/login" type="primary">
                    Los geht's!
                </Button>
            </Layout.Content>
        </Layout>
    );
}

export default Home;

