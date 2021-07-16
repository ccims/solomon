import React, { useRef } from 'react';
import {
  BrowserRouter as Router
} from "react-router-dom";
import { DeploymentEnvironment } from 'solomon-models';

import './App.css';
import MyAppBar from './components/shared/appbar';
import Routes from './routes';

export const SELECTED_ENV = DeploymentEnvironment.KUBERNETES; // TODO: make this configurable in ui

function App() {

  const routerRef = useRef<any>();

  return (
    <div className="App">
      <Router ref={routerRef}>
          <MyAppBar></MyAppBar>
          <Routes></Routes>
        </Router>
    </div>
  );
}

export default App;
