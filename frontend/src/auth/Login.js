import React, { useState } from 'react';
import { Layout, PageHeader, Card, Form, Input, Button } from 'antd';

const onFinishLogin = values => {
  console.log('Received values from Login tab', values);
}

const onFinishRegister = values => {
  console.log('Received values from Register tab', values);
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const tabList = [
  {
    key: 0,
    tab: 'Anmelden',
  },
  {
    key: 1,
    tab: 'Registrieren',
  },
];

const contentList = {
  0: // Anmelden
  <Form {...layout} onFinish={onFinishLogin}>
    <Form.Item
      label="Email-Adresse"
      name="email"
      rules={[{required:true, message:'Bitte geben Sie Ihre Email-Adresse ein!'}, {type:'email', message:'Die eingegebene Email-Adresse ist ungültig'}]}
    >
      <Input/>
    </Form.Item>
    <Form.Item
      label="Passwort"
      name="password"
      rules={[{required:true, message:'Bitte geben Sie ein Passwort ein!'}]}
    >
      <Input.Password />
    </Form.Item>
    <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
      <Button type="primary" htmlType="submit">
        Anmelden
      </Button>
    </Form.Item>
  </Form>,

  1: // Registrieren
  <Form {...layout} onFinish={onFinishRegister}>
    <Form.Item
      label="Email-Adresse"
      name="email"
      rules={[{required:true, message:'Bitte geben Sie Ihre Email-Adresse ein!'}, {type:'email', message:'Die eingegebene Email-Adresse ist ungültig'}]}
    >
      <Input/>
    </Form.Item>
    <Form.Item
      label="Passwort"
      name="password"
      rules={[{required:true, message:'Bitte geben Sie ein Passwort ein!'}]}
    >
      <Input.Password />
    </Form.Item>
    <Form.Item
      label="Passwort wiederholen"
      name="repeatPassword"
      rules={[
        {required:true, message:'Bitte wiederholen Sie Ihr Passwort!'},
        ({ getFieldValue }) => ({
          validator(rule, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject('Die eingegebenen Passwörter stimmen nicht überein');
          },
        })]}
    >
      <Input.Password />
    </Form.Item>
    <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
      <Button type="primary" htmlType="submit">
        Registrieren
      </Button>
    </Form.Item>
  </Form>,
};


function Login() {
  const [tab, setTab] = useState(0);
  return (
    <Layout>
      <Layout.Content>
        <PageHeader
          className="site-page-header"
          // onBack={() => null}
          title="Authentifizierung"
        />
        
            <Card
              tabList={tabList}
              onTabChange={key => {
                setTab(key);
              }}
              style={{margin: "8px"}}
            >
              {contentList[tab]}
            </Card>
      </Layout.Content>
    </Layout>


  );
}

export default Login;
