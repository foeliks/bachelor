import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import 'antd/dist/antd.css'
// import './index.css';
import Home from './home/Home.js';
import Login from './auth/Login.js';
import Categories from './categories/Categories.js';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Route exact path='/' component={Home} />
      <Route path='/login' component={Login} />
      <Route path='/categories' component={Categories} />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

