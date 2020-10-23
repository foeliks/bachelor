import React, { Component } from 'react';
import 'antd/dist/antd.css'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from 'react-router-dom';
import {
    Home,
    Login,
    Categories
} from './components';

function App() {
    return (
        <Router>
            <Route exact path='/' component={Home} />
            <Route path='/login' component={Login} />
            <Route path='/categories' component={Categories} />
        </Router>
    );
}

export default App;