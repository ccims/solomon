import React from "react";
import { Route, Switch } from "react-router-dom";
import SloEditPage from './components/pages/slo-edit/slo-edit';
import SloListPage from './components/pages/slo-list/slo-list';

export enum RoutePaths {
    SLO_EDIT = "/slo",
    SLO_LIST = "/"
} 

export default function Routes() {
    return <Switch>
        <Route path={`${RoutePaths.SLO_EDIT}/:ruleId`}>
            <SloEditPage></SloEditPage>
        </Route>
        <Route path={RoutePaths.SLO_EDIT}>
            <SloEditPage></SloEditPage>
        </Route>
        <Route path={RoutePaths.SLO_LIST} exact>
            <SloListPage></SloListPage>
        </Route>
    </Switch>
}