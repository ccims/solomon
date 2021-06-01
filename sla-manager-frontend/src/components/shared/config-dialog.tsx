import { Button, Dialog, DialogActions, DialogContent, DialogTitle, ListItem, makeStyles, Typography } from "@material-ui/core";
import { Field, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import { TextField, Select } from "formik-material-ui";
import * as api from "../../api";
import { DeploymentEnvironment, SolomonInstanceConfig } from "../../models/config.model";

const useStyles = makeStyles((theme) => ({
    form: {
        '& > *': {
            margin: theme.spacing(1),
        },
    }
}));

export default function ConfigDialog({ open, onClose, setConfig, config }) {

    const [error, setError] = useState<string>();
    const router = useHistory();
    const classes = useStyles();

    const [gropiusProjects, setGropiusProjects] = useState<any[]>();

    useEffect(() => {
        api.fetchGropiusProjects().then(res => setGropiusProjects(res));
    }, [])

    useEffect(() => {

    }, [config])

    return (
        <Formik
            initialValues={{
                gropiusProjectId: config?.gropiusProjectId,
                deploymentEnvironment: config?.deploymentEnvironment,
            }}
            validationSchema={Yup.object({
                gropiusProjectId: Yup.string().required("Required"),
                deploymentEnvironment: Yup.string().required("Required"),
            })}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
                try {
                    const res = await api.setConfig(values as SolomonInstanceConfig);
                    if (res) {
                        // TODO set Context
                        setConfig(res);
                        onClose();
                        router.push("/slos");
                    } else {
                        setError("An error occurred, please try again");
                    }
                    setSubmitting(false);
                } catch (error) {
                    console.log("Error submitting", error);
                    setError("An error occurred, please try again");
                    setSubmitting(false);
                }
            }}
        >
            {(formik) => (
                <Dialog open={open} onClose={onClose}>
                    <DialogTitle>Configure your Solomon Instance</DialogTitle>
                    <DialogContent>
                        <div className={ classes.form }>
                            {/* TODO: Make dropdown */}
                            <Field
                                component={TextField}
                                variant="outlined"
                                fullWidth
                                name="gropiusProjectId"
                                label="Gropius Project ID"
                                type="text"
                            ></Field>
                            {/* <Field
                                component={Select}
                                variant="outlined"
                                fullWidth
                                name="gropiusProjectId"
                                label="Gropius Project ID"
                                type="checkbox"
                            >
                                { gropiusProjects?.map((project: any) => <ListItem key={project.node.id} value={project.node.id}>{ project.node.name }</ListItem> ) }
                            </Field> */}
                            <Field
                                component={Select}
                                variant="outlined"
                                fullWidth
                                name="deploymentEnvironment"
                                label="Deployment Environment"
                                type="checkbox"
                            >
                                <ListItem value={DeploymentEnvironment.KUBERNETES}>Kubernetes</ListItem>
                                <ListItem value={DeploymentEnvironment.AWS}>AWS</ListItem>
                            </Field>


                            {error && (
                                <Typography
                                    variant="subtitle1"
                                    className="text-center text-red-500"
                                >
                                    {error}
                                </Typography>
                            )}
                        </div>
                        {error && (
                            <Typography
                            variant="subtitle1"
                            className="text-center text-red-500"
                            >
                            {error}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={ () => formik.handleSubmit() } color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Formik>
    )
}