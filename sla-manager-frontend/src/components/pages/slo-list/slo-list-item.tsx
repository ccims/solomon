import { Box, Card } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import SlaRule from "../../../models/sla-rule.model";

type SlaItemProps = { sla: SlaRule };

export default function SlaItem({ sla }: SlaItemProps) {

    return (
        // TODO add edit icon
        <Box paddingY={1}>
            <Link to={`/sla/${sla.id}`}>
                <Card>
                    <Box p={2}>
                        <h1>{ sla.name }</h1>
                        <p>{ sla.description }</p>
                    </Box>
                </Card>
            </Link>
        </Box>
    );
}