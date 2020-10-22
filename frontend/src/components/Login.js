import React, {useState} from 'react';
import {
    Layout,
    PageHeader,
    Card,
    Form,
    Input,
    Button
} from 'antd';
import axios from 'axios';


function Login() {

    const [tab, setTab] = useState(0);
    const [loggedIn, setLoggedIn] = useState(false);


    const onFinishLogin = (data) => {
        axios({
            method: 'post',
            url: 'http://localhost:8000/token-auth/',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        })
        .then(res => {
          localStorage.setItem('token', res.token);
          setLoggedIn(true);
        })
        .catch(error => console.log(error));

    }
    const onFinishRegister = data => {
        axios({
            method: 'post',
            url: 'http://localhost:8000/robob/users/',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }).then(res => {
          localStorage.setItem('token', res.token);
          setLoggedIn(true);
        }).catch(error => console.log(error));
    }
    const layout = {
        labelCol: {
            span: 6
        },
        wrapperCol: {
            span: 16
        }
    };
    const tabList = [
        {
            key: 0,
            tab: 'Anmelden'
        }, {
            key: 1,
            tab: 'Registrieren'
        },
    ];
    const contentList = {
        0: <Form {...layout}
            onFinish={onFinishLogin}>
            <Form.Item label="Benutzername" name="username"
                rules={
                    [
                        {
                            required: true,
                            message: 'Bitte geben Sie Ihren Benutzernamen ein!'
                        }
                    ]
            }>
                <Input/>
            </Form.Item>
            <Form.Item label="Passwort" name="password"
                rules={
                    [{
                            required: true,
                            message: 'Bitte geben Sie ein Passwort ein!'
                        }]
            }>
                <Input.Password/>
            </Form.Item>
            <Form.Item wrapperCol={
                {
                    ... layout.wrapperCol,
                    offset: 6
                }
            }>
                <Button type="primary" htmlType="submit">
                    Anmelden
                </Button>
            </Form.Item>
        </Form>,
        1: <Form {...layout}
            onFinish={onFinishRegister}>
            <Form.Item label="Email-Adresse" name="email"
                rules={
                    [
                        {
                            required: true,
                            message: 'Bitte geben Sie Ihre Email-Adresse ein!'
                        }, {
                            type: 'email',
                            message: 'Die eingegebene Email-Adresse ist ungültig'
                        }
                    ]
            }>
                <Input/>
            </Form.Item>
            <Form.Item label="Benutzername" name="username"
                rules={
                    [
                        {
                            required: true,
                            message: 'Bitte geben Sie Ihren Benutzernamen ein!'
                        }
                    ]
            }>
                <Input/>
            </Form.Item>
            <Form.Item label="Passwort" name="password"
                rules={
                    [{
                            required: true,
                            message: 'Bitte geben Sie ein Passwort ein!'
                        }]
            }>
                <Input.Password/>
            </Form.Item>
            <Form.Item label="Passwort wiederholen" name="repeatPassword"
                rules={
                    [
                        {
                            required: true,
                            message: 'Bitte wiederholen Sie Ihr Passwort!'
                        }, ({getFieldValue}) => (
                            {
                                validator(rule, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('Die eingegebenen Passwörter stimmen nicht überein');
                                }
                            }
                        )
                    ]
            }>
                <Input.Password/>
            </Form.Item>
            <Form.Item wrapperCol={
                {
                    ... layout.wrapperCol,
                    offset: 6
                }
            }>
                <Button type="primary" htmlType="submit">
                    Registrieren
                </Button>
            </Form.Item>
        </Form>
    };
    const logged_out_comp = (
        <Card tabList={tabList}
            onTabChange={
                key => {
                    setTab(key);
                }
            }
            style={
                {margin: "8px"}
        }>
            {
            contentList[tab]
        } </Card>
    );
    const logged_in_comp = (
        <Button onClick={() => {
          localStorage.removeItem('token');
          setLoggedIn(false);
        }}>Logout</Button>
    )

    return (
        <Layout>
            <Layout.Content>
                <PageHeader className="site-page-header"
                    // onBack={() => null}
                    title="Authentifizierung"
                />
                <div>{loggedIn ? logged_in_comp : logged_out_comp}</div>
            </Layout.Content>
        </Layout>
    );
}

export default Login;

