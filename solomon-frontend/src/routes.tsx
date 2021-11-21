import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import DeploymentsPage from "./components/pages/deployments/deployments";
import SloEditPage from './components/pages/slo-edit/slo-edit';
import SloListPage from './components/pages/slo-list/slo-list';

export enum RoutePaths {
    SLO_EDIT = "/slo",
    DEPLOYMENTS = "/deployments",
    SLO_LIST = "/slos"
} 

export default function Routes() {
    return <Switch>
        <Route path={`${RoutePaths.SLO_EDIT}/:ruleId`}>
            <SloEditPage></SloEditPage>
        </Route>
        <Route path={RoutePaths.SLO_EDIT}>
            <SloEditPage></SloEditPage>
        </Route>
        <Route path={RoutePaths.SLO_LIST}>
            <SloListPage></SloListPage>
        </Route>
        <Route path={RoutePaths.DEPLOYMENTS}>
            <DeploymentsPage></DeploymentsPage>
        </Route>
        <Route path="/">
            <SloListPage></SloListPage>
        </Route>
    </Switch>
}