// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './Routes'; // Ensure this path is correct

ReactDOM.render(
  <Router>
    <Routes />
  </Router>,
  document.getElementById('root')
);
