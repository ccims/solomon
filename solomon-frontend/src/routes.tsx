import { Route, Switch } from "react-router-dom"
import SloListPage from './components/pages/slo-list/slo-list';
import SloEditPage from './components/pages/slo-edit/slo-edit';
import LandingPage from './components/pages/landing/landing';
import React from "react";

export enum RoutePaths {
    SLO_EDIT = "/slo",
    SLO_LIST = "/"
} 

export default function Routes() {
    return <Switch>
        <Route path={`${RoutePaths.SLO_EDIT}/:id`}>
            <SloEditPage></SloEditPage>
        </Route>
        <Route path={RoutePaths.SLO_EDIT}>
            <SloEditPage></SloEditPage>
        </Route>
        <Route path={RoutePaths.SLO_LIST}>
            <SloListPage></SloListPage>
        </Route>
    </Switch>
}