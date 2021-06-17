import { IconButton, Toolbar, Typography, AppBar, Icon, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    title: {
        flexGrow: 1,
    },
}));

export default function MyAppBar() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={ classes.title }>
                        Solomon
                    </Typography>
                </Toolbar>
            </AppBar>

        </div>
    )
}
