import { Box, Card } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { SloRule } from "../../../../../solomon-models/dist";

type SloItemProps = { sla: SloRule };

export default function SloItem({ sla }: SloItemProps) {

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