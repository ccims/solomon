import { Button, Container } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRules } from "../../../api";
import SlaRule from "../../../models/sla-rule.model";
import SlaItem from "./slo-list-item";

export default function SloListPage() {

    const [slas, setSLAs] = useState<SlaRule[]>();

    useEffect(() => {
        fetchRules().then(res => setSLAs(res));
    }, [])

    console.log("SLOs", slas ?? undefined);

    return <Container>
        {/* { slas?.map(sla => <SlaItem key={sla.id} sla={sla}></SlaItem>) ?? [] } */}
        <Link to="/sla/">
            <Button variant="contained" color="secondary">Add SLA</Button>
        </Link>
    </Container>
}