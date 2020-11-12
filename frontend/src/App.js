import React, { useState, useEffect } from 'react';
import 'antd/dist/antd.css';
import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Redirect
} from 'react-router-dom';
import {
    Home,
    Overview,
    PageLayout,
    Task,
    Diary,
    Ranking
} from './components';

function App() {
    const [loggedIn, setLoggedIn] = useState(
        localStorage.getItem('token') ? true : false
    );
    const [username, setUsername] = useState('');
    const [gameMode, setGameMode] = useState(0);
    const [redirect, setRedirect] = useState(false);
    const [nextTaskWithOptional, setNextTaskWithOptional] = useState(0);
    const [nextTaskWithoutOptional, setNextTaskWithoutOptional] = useState(0);

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
                        json.game_mode === false ? setGameMode(0) : setGameMode(1)
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

    useEffect(() => {
        if (loggedIn) {

            fetch(`http://localhost:8000/robob/game-mode/${gameMode}`, {
                method: 'post',
                headers: {
                    Authorization: `JWT ${localStorage.getItem('token')}`
                }
            }).catch(error => console.log(error))


            fetch(`http://localhost:8000/robob/next-task/`, {
                headers: {
                    Authorization: `JWT ${localStorage.getItem('token')}`
                }
            })
                .then(res => {
                    if (res.status !== 200) {
                        logOut();
                    }
                    else {
                        res.json()
                            .then(json => {
                                setNextTaskWithOptional(json.task_with_optional);
                                setNextTaskWithoutOptional(json.task_without_optional);
                                setRedirect(false);
                            })
                    }
                })
                .catch(error => console.log(error))
        }
    }, [gameMode, loggedIn])


    const values = {
        loggedIn: loggedIn,
        username: username,
        redirect: redirect,
        gameMode: gameMode,
        nextTaskWithOptional: nextTaskWithOptional,
        nextTaskWithoutOptional: nextTaskWithoutOptional
    }
    const functions = {
        setLoggedIn: setLoggedIn,
        setUsername: setUsername,
        setRedirect: setRedirect,
        setGameMode: setGameMode,
        setNextTaskWithOptional: setNextTaskWithOptional,
        setNextTaskWithoutOptional: setNextTaskWithoutOptional,
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
                        <Overview />
                    </PageLayout>}
            </Route>
            <Route path='/diary' >
                {redirect ? <Redirect to="/" /> :
                    <PageLayout values={values} functions={functions} >
                        <Diary />
                    </PageLayout>}
            </Route>
            <Route path='/task/:taskId'>
                {redirect ? <Redirect to="/" /> :
                    <PageLayout values={values} functions={functions} >
                        <Task />
                    </PageLayout>}
            </Route>
            <Route path='/ranking' >
                {redirect ? <Redirect to="/" /> :
                    <PageLayout values={values} functions={functions} >
                        <Ranking />
                    </PageLayout>}
            </Route>
        </Router>
    );
}

export default App;