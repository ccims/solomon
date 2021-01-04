import { ApolloClient, gql, InMemoryCache } from "@apollo/client/core";
import { Button, Container } from "@material-ui/core";
import Axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRules } from "../api";
import SlaItem from "../components/rule-item";
import SlaRule from "../models/sla-rule.model";

export default function HomePage() {

    const [slas, setSLAs] = useState<SlaRule[]>();

    useEffect(() => {
        fetchRules().then(res => setSLAs(res));
    }, [])

    return <Container>
        { slas?.map(sla => <SlaItem key={sla.id} sla={sla}></SlaItem>) ?? [] }
        <Link to="/sla/">
            <Button variant="contained" color="secondary">Add SLA</Button>
        </Link>
    </Container>
}