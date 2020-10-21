import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css'
import './index.css';
import Login from './auth/Login.js';
import Categories from './categories/Categories.js';

ReactDOM.render(
  <React.StrictMode>
    <Login />
    <Categories />
  </React.StrictMode>,
  document.getElementById('root')
);

