import { Button, Container } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SloRule } from "solomon-models";
import { fetchRules } from "../../../api";
import { SELECTED_ENV } from "../../../App";
import { RoutePaths } from "../../../routes";
import SloItem from "./slo-list-item";

export default function SloListPage() {

    const [slos, setSLOs] = useState<SloRule[]>();

    // TODO:
    useEffect(() => {
        fetchRules(SELECTED_ENV).then(res => setSLOs(res));
    }, [])

    return <Container>
        { slos?.map(sla => <SloItem key={sla.id} sla={sla}></SloItem>) ?? [] }
        <Link to={RoutePaths.SLO_EDIT}>
            <Button variant="contained" color="secondary">Add SLA</Button>
        </Link>
    </Container>
}