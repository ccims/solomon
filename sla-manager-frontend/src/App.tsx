import React from 'react';
import './App.css';
import MyAppBar from './components/appbar';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import HomePage from './pages/home';
import RuleEditPage from './pages/rule-edit';

function App() {
  return (
    <div className="App">
      <Router>
        <MyAppBar></MyAppBar>
        <Switch>
          <Route path="/sla/:id">
            <RuleEditPage></RuleEditPage>
          </Route>
          <Route path="/sla">
            <RuleEditPage></RuleEditPage>
          </Route>
          <Route path="/">
            <HomePage></HomePage>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
