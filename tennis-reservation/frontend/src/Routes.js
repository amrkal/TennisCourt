// src/Routes.js

import React from 'react';
import { Route, Routes as Switch } from 'react-router-dom';
import App from './App'; // Example component
// import LoginPage from './LoginPage'; // Example component
// import AdminPage from './AdminPage'; // Example component

const Routes = () => (
  <Switch>
    <Route path="/" element={<App />} />
  </Switch>
);

export default Routes;
