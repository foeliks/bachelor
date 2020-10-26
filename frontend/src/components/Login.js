import React, { useState } from 'react';
import {
    Layout,
    PageHeader,
    Card,
    Form,
    Input,
    Button
} from 'antd';


function Login(props) {

    const [tab, setTab] = useState(0);
    

    const onFinishLogin = (data) => {
        fetch('http://localhost:8000/token-auth/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(json => {
                localStorage.setItem('token', json.token);
                props.functions.setLoggedIn(true);
            })
            .catch(error => console.log(error));;

    }
    const onFinishRegister = data => {
        fetch('http://localhost:8000/robob/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(json => {
                localStorage.setItem('token', json.token);
                props.functions.setLoggedIn(true);
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
                <Input />
            </Form.Item>
            <Form.Item label="Passwort" name="password"
                rules={
                    [{
                        required: true,
                        message: 'Bitte geben Sie ein Passwort ein!'
                    }]
                }>
                <Input.Password />
            </Form.Item>
            <Form.Item wrapperCol={
                {
                    ...layout.wrapperCol,
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
                <Input />
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
                <Input />
            </Form.Item>
            <Form.Item label="Passwort" name="password"
                rules={
                    [{
                        required: true,
                        message: 'Bitte geben Sie ein Passwort ein!'
                    }]
                }>
                <Input.Password />
            </Form.Item>
            <Form.Item label="Passwort wiederholen" name="repeatPassword"
                rules={
                    [
                        {
                            required: true,
                            message: 'Bitte wiederholen Sie Ihr Passwort!'
                        }, ({ getFieldValue }) => (
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
                <Input.Password />
            </Form.Item>
            <Form.Item wrapperCol={
                {
                    ...layout.wrapperCol,
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
            >
            {
                contentList[tab]
            } </Card>
    );
    const logged_in_comp = (
        <Button onClick={() => {
            localStorage.removeItem('token');
            props.functions.setLoggedIn(false);
        }}>Logout</Button>
    )

    return (
        <Layout>
            <Layout.Content>
                <PageHeader className="site-page-header"
                    // onBack={() => null}
                    title="Melde dich an, um anzufangen"
                />
                <div>{props.values.loggedIn ? logged_in_comp : logged_out_comp}</div>
            </ Layout.Content>
        </Layout>
    );
}

export default Login;

