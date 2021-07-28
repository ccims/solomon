import { Box, Card } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { Slo } from "solomon-models";
import { RoutePaths } from "../../../routes";

interface RuleItemProps {
  rule: Slo;
}

const RuleItem: React.FunctionComponent<RuleItemProps> = ({ rule }) => {
  return (
    <Box paddingY={1}>
      <Link to={`${RoutePaths.SLO_EDIT}/${rule.id}`}>
        <Card>
          <Box p={2}>
            <h1>{rule.name}</h1>
            <p>{rule.description}</p>
          </Box>
        </Card>
      </Link>
    </Box>
  );
};

export default RuleItem;