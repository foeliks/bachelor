import React, { useState, useEffect } from 'react';
import 'antd/dist/antd.css'
import {
    BrowserRouter as Router,
    Route,
    Redirect
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
    const [redirect, setRedirect] = useState(false);

    const logOut = () => {
        localStorage.removeItem('token');
        setLoggedIn(false);
        setRedirect(true);
        setUsername('');
    }

    useEffect(() => {
        if (loggedIn) {
            if (username === '') {
                fetch('http://localhost:8000/robob/current_user/', {
                    headers: {
                        Authorization: `JWT ${localStorage.getItem('token')}`
                    }
                })
                    .then(res => res.json())
                    .then(json => {
                        setUsername(json.username)
                    })
                    .catch(error => {
                        console.log(error)
                        logOut()
                    });
            }
            else {
                fetch('http://localhost:8000/token-auth-refresh/', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'token': localStorage.getItem('token')
                    })
                })
                    .then(res => {
                        if (res.status !== 200) {
                            console.log(res);
                            logOut();
                        }
                        else {
                            res.json()
                                .then(json => {
                                    localStorage.setItem('token', json.token)
                                    setRedirect(false);
                                })
                        }
                    })
                    .catch(error => {
                        console.log(error)
                        logOut()
                    });
            }
        }
    });


    const values = {
        loggedIn: loggedIn,
        username: username,
        redirect: redirect
    }
    const functions = {
        setLoggedIn: setLoggedIn,
        setUsername: setUsername,
        setRedirect: setRedirect,
        logOut: logOut
    }
    return (
        <Router>
            <Route exact path='/'>
                <PageLayout values={values} functions={functions} >
                    <Home />
                </PageLayout>
            </Route>
            <Route path='/overview' >
                {redirect ? <Redirect to="/" /> :
                    <PageLayout values={values} functions={functions} >
                        <Categories />
                    </PageLayout>}
            </Route>
        </Router>
    );
}

export default App;