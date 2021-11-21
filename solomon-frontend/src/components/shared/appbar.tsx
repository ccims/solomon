import {
  IconButton,
  Toolbar,
  Typography,
  AppBar,
  Icon,
  makeStyles,
  Button,
} from "@material-ui/core";
import React from "react";
import { NavLink } from "react-router-dom";
import { RoutePaths } from "../../routes";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  button: {
    "&.active": {
      background: theme.palette.action.active,
    },
  },
}));

export default function MyAppBar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            className={classes.title}
            style={{ flexGrow: 1 }}
          >
            Solomon
          </Typography>
          <Button
            className={classes.button}
            color="inherit"
            component={NavLink}
            to={RoutePaths.SLO_LIST}
          >
            SLOs
          </Button>
          <Button
            className={classes.button}
            color="inherit"
            component={NavLink}
            to={RoutePaths.DEPLOYMENTS}
          >
            Environments
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
