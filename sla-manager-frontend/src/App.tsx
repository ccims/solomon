import React, { createContext, useEffect, useRef, useState } from 'react';
import './App.css';
import MyAppBar from './components/shared/appbar';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  BrowserRouter,
} from "react-router-dom";
import SloListPage from './components/pages/slo-list/slo-list';
import SloEditPage from './components/pages/slo-edit/slo-edit';
import LandingPage from './components/pages/landing/landing';
import { SolomonInstanceConfig } from './models/config.model';
import { fetchConfig } from './api';
import ConfigDialog from './components/shared/config-dialog';

export const ConfigContext = createContext<SolomonInstanceConfig>(undefined);

function App() {

  const [config, setConfig] = useState<SolomonInstanceConfig>(undefined);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);

  const routerRef = useRef<any>();

  useEffect(() => {
    loadConfig();
  }, [])

  async function loadConfig() {
    try {
      const config = await fetchConfig();
      if (config) {
        setConfig(config);
        routerRef.current.history.push("/slos");
      } else {
        setOpenConfigDialog(true);
      }
    } catch(error) {
      console.log("Error fetching Config", error)
    }
  }

  return (
    <div className="App">
      <ConfigContext.Provider value={config}>
        <Router ref={routerRef}>
          <MyAppBar openConfig={ () => setOpenConfigDialog(true) }></MyAppBar>
          <ConfigDialog open={openConfigDialog} onClose={ () => setOpenConfigDialog(false) } setConfig={ (config) => setConfig(config) } config={config}></ConfigDialog>
          <Switch>
            <Route path="/sla/:id">
              <SloEditPage></SloEditPage>
            </Route>
            <Route path="/sla">
              <SloEditPage></SloEditPage>
            </Route>
            <Route path="/slos">
              <SloListPage></SloListPage>
            </Route>
            <Route path="/">
              <LandingPage></LandingPage>
            </Route>
          </Switch>
        </Router>
      </ConfigContext.Provider>
    </div>
  );
}

export default App;
