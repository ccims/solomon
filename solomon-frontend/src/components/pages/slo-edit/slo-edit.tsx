import {
    Box,
    Button,
    Card,
    Container, ListItem, makeStyles
} from "@material-ui/core";
import { Field, Formik } from "formik";
import { Select, TextField } from "formik-material-ui";
import React, { useEffect, useState } from "react";
import {
    DeploymentEnvironment, FunctionOptions,
    MetricOptions,
    OperatorOptions,
    PresetOptions, SloRule, Target
} from "solomon-models/";
import * as Yup from "yup";
import { fetchGropiusComponents, fetchTargets, postRule } from "../../../api";
import { SELECTED_ENV, SELECTED_GROPIUS_PROJECT_ID } from "../../../App";



const useStyles = makeStyles((theme) => ({
    root: {
        "& > *": {
            margin: theme.spacing(1),
        },
    },
}));

export default function SloEditPage() {
    const classes = useStyles();

    const [targets, setTargets] = useState<Target[]>(undefined);
    const [gropiusComponents, setGropiusComponents] = useState<any[]>(undefined);

    useEffect(() => {
        fetchTargets(SELECTED_ENV).then((res) => setTargets(res));
        fetchGropiusComponents(SELECTED_GROPIUS_PROJECT_ID).then((res) => setGropiusComponents(res));
    }, [])

    const defaultValues: SloRule = {
        name: "",
        description: "",

        deploymentEnvironment: DeploymentEnvironment.KUBERNETES,
        targetId: "",
        gropiusProjectId: "",
        gropiusComponentId: "", 

        preset: PresetOptions.AVAILABILITY,
        metric: MetricOptions.PROBE_SUCCESS,
        operator: OperatorOptions.SMALLER_THEN,
        function: FunctionOptions.AVG_OVER_TIME,

        value: 1,
        duration: 60
    }

    return (
        <Container>
            <Card>
                <Box p={2}>
                    <Formik
                        initialValues={defaultValues}
                        validationSchema={Yup.object({
                            // TODO: comprehensive validation
                            name: Yup.string().required("Required"),
                            value: Yup.string().required("Required"),
                            duration: Yup.string().required("Required"),
                          })}
                        onSubmit={(values) => {
                            postRule(values);
                        }}
                    >
                        {({ values, handleSubmit, setFieldValue }) => (
                            <div className={classes.root}>
                                <p>Meta Data</p>
                                <Field
                                    component={TextField}
                                    fullWidth
                                    variant="outlined"
                                    label="Name"
                                    name="name"
                                    type="text"
                                    placeholder="Name"
                                ></Field>
                                <Field
                                    component={TextField}
                                    fullWidth
                                    variant="outlined"
                                    label="Description"
                                    name="description"
                                    type="text"
                                    placeholder="Description"
                                ></Field>

                                <p>Targets</p>
                                <Field
                                    component={Select}
                                    type="checkbox"
                                    fullWidth
                                    variant="outlined"
                                    label="deploymentEnvironment"
                                    name="deploymentEnvironment"
                                >
                                    {Object.values(DeploymentEnvironment).map((value) => (
                                        <ListItem key={value} value={value}>
                                            {value}
                                        </ListItem>
                                    ))}
                                </Field>

                                <Field
                                    component={Select}
                                    type="checkbox"
                                    fullWidth
                                    variant="outlined"
                                    label="deploymentEnvironment"
                                    name="deploymentEnvironment"
                                >
                                    {targets?.map((target) => (
                                        <ListItem key={target.targetId} value={target.targetId}>
                                            {target.targetName}
                                        </ListItem>
                                    ))}
                                </Field>

                                <Field
                                    component={TextField}
                                    fullWidth
                                    variant="outlined"
                                    label="gropiusProjectId"
                                    name="gropiusProjectId"
                                    type="number"
                                    placeholder="gropiusProjectId"
                                ></Field>

                                <Field
                                    component={TextField}
                                    fullWidth
                                    variant="outlined"
                                    label="gropiusComponentId"
                                    name="gropiusComponentId"
                                    type="number"
                                    placeholder="gropiusComponentId"
                                ></Field>

                                <p>Properties</p>
                                <Field
                                    component={Select}
                                    type="checkbox"
                                    fullWidth
                                    variant="outlined"
                                    label="Preset"
                                    name="preset"
                                    onChange={(e) => {
                                        if (e.target.value === PresetOptions.AVAILABILITY) {
                                            setFieldValue("preset", PresetOptions.AVAILABILITY);
                                            setFieldValue("metric", MetricOptions.PROBE_SUCCESS);
                                            setFieldValue("operator", OperatorOptions.SMALLER_THEN);
                                            setFieldValue("function", FunctionOptions.AVG_OVER_TIME);
                                        } else if (e.target.value === PresetOptions.RESPONSE_TIME) {
                                            setFieldValue("preset", PresetOptions.RESPONSE_TIME);
                                            setFieldValue("metric", MetricOptions.RESPONSE_TIME);
                                            setFieldValue("operator", OperatorOptions.GREATER_THEN);
                                            setFieldValue("function", FunctionOptions.AVG_OVER_TIME);
                                        } else {
                                            setFieldValue("preset", PresetOptions.CUSTOM);
                                        }
                                    }}
                                >
                                    {Object.values(PresetOptions).map((value) => (
                                        <ListItem key={value} value={value}>
                                            {value}
                                        </ListItem>
                                    ))}
                                </Field>

                                { values.preset === PresetOptions.CUSTOM && <Field
                                    component={Select}
                                    type="checkbox"
                                    fullWidth
                                    variant="outlined"
                                    label="Metric"
                                    name="metric"
                                >
                                    {Object.values(MetricOptions).map((value) => (
                                        <ListItem key={value} value={value}>
                                            {value}
                                        </ListItem>
                                    ))}
                                </Field>}

                                { values.preset === PresetOptions.CUSTOM && <Field
                                    component={Select}
                                    type="checkbox"
                                    fullWidth
                                    variant="outlined"
                                    label="Operator"
                                    name="operator"
                                >
                                    {Object.values(OperatorOptions).map((value) => (
                                        <ListItem key={value} value={value}>
                                            {value}
                                        </ListItem>
                                    ))}
                                </Field>}

                                <Field
                                    component={Select}
                                    type="checkbox"
                                    fullWidth
                                    variant="outlined"
                                    label="Function"
                                    name="function"
                                >
                                    {Object.values(FunctionOptions).map((value) => (
                                        <ListItem key={value} value={value}>
                                            {value}
                                        </ListItem>
                                    ))}
                                </Field>

                                <Field
                                    component={TextField}
                                    fullWidth
                                    variant="outlined"
                                    label="duration"
                                    name="duration"
                                    type="number"
                                    placeholder="duration"
                                ></Field>

                                <Field
                                    component={TextField}
                                    fullWidth
                                    variant="outlined"
                                    label="value"
                                    name="value"
                                    type="number"
                                    placeholder="value"
                                ></Field>
                                <Button variant="contained" color="secondary" onClick={ () => handleSubmit() }>Save</Button>
                            </div>
                        )}
                    </Formik>
                </Box>
            </Card>
        </Container>
    );
}
