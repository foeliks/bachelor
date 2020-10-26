import React, { useState, useEffect } from 'react';
import 'antd/dist/antd.css'
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    useHistory
} from 'react-router-dom';
import {
    Home,
    Categories,
    PageLayout
} from './components';

function App() {
    const [loggedIn, setLoggedIn] = useState(
        localStorage.getItem('token') ? true : false
    );
    const [username, setUsername] = useState('');
    const history = useHistory();

    // useEffect(() => {
    //     if (loggedIn) {
    //         fetch('http://localhost:8000/robob/current_user/', {
    //             headers: {
    //                 Authorization: `JWT ${localStorage.getItem('token')}`
    //             }
    //         })
    //             .then(res => res.json())
    //             .then(json => {
    //                 setUsername(json.username)
    //             });
    //     }
    // });

    useEffect(() => {
        if (loggedIn) {
            fetch('http://localhost:8000/token-auth-refresh/', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'token': localStorage.getItem('token')
                })
            })
                .then(res => res.json())
                .then(json => localStorage.setItem('token', json.token))
                .catch(error => {
                    localStorage.removeItem('token');
                    setLoggedIn(false);
                    history.push("/");
                })
        }
    });

    const values = {
        loggedIn: loggedIn,
        username: username
    }
    const functions = {
        setLoggedIn: setLoggedIn,
        setUsername: setUsername
    }
    return (
        <Router>
            <Route exact path='/'>
                <PageLayout values={values} functions={functions} >
                    <Home />
                </PageLayout>
            </Route>
            <Route path='/categories' >
                {loggedIn ?
                    <PageLayout values={values} functions={functions} >
                        <Categories />
                    </PageLayout>
                    : <Redirect to="/" />}
            </Route>
        </Router>
    );
}

export default App;