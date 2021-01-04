import { IconButton, Toolbar, Typography, AppBar } from "@material-ui/core";
import React from "react";

export default function MyAppBar() {
    return (<AppBar position="static">
    <Toolbar>
        <Typography variant="h6">
            SLA Manager
        </Typography>
    </Toolbar>
    </AppBar>)
}
