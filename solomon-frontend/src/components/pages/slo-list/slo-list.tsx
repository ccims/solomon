import { Button, Container } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Slo } from "solomon-models";
import { fetchRules } from "../../../api";
import { SELECTED_ENV } from "../../../App";
import { RoutePaths } from "../../../routes";
import RuleItem from "./slo-list-item";

export default function SloListPage() {

    const [rules, setRules] = useState<Slo[]>();

    useEffect(() => {
        fetchRules(SELECTED_ENV).then(res => setRules(res));
    }, [])

    return <Container>
        { rules?.map((rule, index) => <RuleItem key={rule.id ?? index} rule={rule}></RuleItem>) ?? [] }
        <Link to={RoutePaths.SLO_EDIT}>
            <Button variant="contained" color="secondary">Add SLO</Button>
        </Link>
    </Container>
}