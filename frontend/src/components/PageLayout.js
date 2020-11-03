import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import 'antd/dist/antd.css';
import {
    Layout,
    Menu
} from 'antd';


function PageLayout(props) {
    const [collapsed, setCollapsed] = useState(false);
    const [selected, setSelected] = useState('')
    const history = useHistory();

    useEffect(() => {
        window.location.pathname === "/" ? setSelected("1") : 
            window.location.pathname === "/overview" && setSelected("2")
    }, []);

    const Children = () => {
        return <div>{React.cloneElement(props.children, {...props})}</div>
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {props.values.loggedIn && <Layout.Sider collapsible collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)}>
                <div className="logo" />
                <Menu theme="dark" mode="inline" selectedKeys={[selected]}>
                    <Menu.Item key="1" onClick={() => history.push("/")}>
                        Startseite
                    </Menu.Item>
                    <Menu.Item key="2" onClick={() => history.push("/overview")}>
                        Übersicht
                    </Menu.Item>
                    <Menu.Item key="3" onClick={() => history.push("/diary")}>
                        Tagebuch
                    </Menu.Item>
                    <Menu.Item key="4" href="/" onClick={() => props.functions.logOut()}>
                        Abmelden
                    </Menu.Item>


                </Menu>
            </Layout.Sider>}
            <Layout>
                <Layout.Content style={{ padding: '50px 50px' }}>
                    <Children {...props} />
                </Layout.Content>
            </Layout>
        </Layout>
    );
}

export default PageLayout;