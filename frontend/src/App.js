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
    Ranking,
    FinishedPage
} from './components';

function App() {
    const [loggedIn, setLoggedIn] = useState(
        localStorage.getItem('token') ? true : false
    );
    const [username, setUsername] = useState(null);
    const [gameMode, setGameMode] = useState(null);
    const [sumStars, setSumStars] = useState(0);
    const [employeeRank, setEmployeeRank] = useState({ id: 0, title: null });
    const [redirect, setRedirect] = useState(false);
    const [nextTaskWithOptional, setNextTaskWithOptional] = useState(0);
    const [nextTaskWithoutOptional, setNextTaskWithoutOptional] = useState(0);
    const [ignoreOptional, setIgnoreOptional] = useState(false);
    const [categories, setCategories] = useState([]);
    const [diary, setDiary] = useState([]);

    const logOut = () => {
        localStorage.removeItem('token');
        setLoggedIn(false);
        setRedirect(true);
        setUsername('');
    }

    const fetchAll = () => {
        fetch('http://localhost:8000/robob/actual-progress', {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    setCategories([]);
                    setDiary([]);
                    logOut();
                }
                else {
                    res.json()
                        .then(json => {
                            setCategories(json.tasks);
                            setDiary(json.diary);
                            setSumStars(json.sum_stars);
                            setEmployeeRank(json.employee_rank);
                        })
                }
            })
            .catch(error => console.error(error))

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
                        })
                }
            })
            .catch(error => console.error(error))
    };

    useEffect(() => {
        if (loggedIn) {
            fetch('http://localhost:8000/robob/current_user/', {
                headers: {
                    Authorization: `JWT ${localStorage.getItem('token')}`
                }
            })
                .then(res => res.json())
                .then(json => {
                    setUsername(json.username);
                    json.game_mode === false ? setGameMode(0) : setGameMode(1);
                    setEmployeeRank(json.employee_rank);
                })
                .catch(error => {
                    console.error(error)
                    logOut()
                });
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
                        console.error(res);
                        logOut();
                    }
                    else {
                        res.json()
                            .then(json => {
                                localStorage.setItem('token', json.token);
                                setRedirect(false);
                            })
                    }
                })
                .catch(error => {
                    console.error(error);
                    logOut();
                });

            fetchAll();
        }
    }, [loggedIn]);

    useEffect(() => {
        if (loggedIn && gameMode != null) {
            fetch(`http://localhost:8000/robob/game-mode/${gameMode}`, {
                method: 'post',
                headers: {
                    Authorization: `JWT ${localStorage.getItem('token')}`
                }
            }).catch(error => console.error(error))

        }
    }, [gameMode])

    const values = {
        loggedIn: loggedIn,
        username: username,
        gameMode: gameMode,
        sumStars: sumStars,
        employeeRank: employeeRank,
        categories: categories,
        diary: diary,
        nextTaskWithOptional: nextTaskWithOptional,
        nextTaskWithoutOptional: nextTaskWithoutOptional,
        ignoreOptional: ignoreOptional,
        robobGreen: "#52C41A" // "#14ba46",
    }
    const functions = {
        setLoggedIn: setLoggedIn,
        setUsername: setUsername,
        setGameMode: setGameMode,
        setSumStars: setSumStars,
        setCategories: setCategories,
        setDiary: setDiary,
        setNextTaskWithOptional: setNextTaskWithOptional,
        setNextTaskWithoutOptional: setNextTaskWithoutOptional,
        setIgnoreOptional: setIgnoreOptional,
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
            <Route exact path='/task/0'>
                {redirect ? <Redirect to="/" /> :
                    <PageLayout values={values} functions={functions} >
                        <FinishedPage />
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