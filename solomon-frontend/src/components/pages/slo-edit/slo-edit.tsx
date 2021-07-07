import {
  Box,
  Button,
  Card,
  Container,
  FormControl,
  InputLabel,
  ListItem,
  makeStyles,
} from "@material-ui/core";
import { Field, Formik } from "formik";
import { Select, TextField } from "formik-material-ui";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  SloRule,
  Target,
  DeploymentEnvironment,
  MetricOption,
  PresetOption,
  StatisticsOption,
  ComparisonOperator,
  GropiusProject,
  GropiusComponent,
} from "solomon-models";
import {
  fetchAlarmActionList,
  fetchGropiusComponents,
  fetchGropiusProjects,
  fetchTargets,
  postRule,
} from "../../../api";
import { SELECTED_ENV, SELECTED_GROPIUS_PROJECT_ID } from "../../../App";
import * as Yup from "yup";

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
  const [gropiusProjects, setGropiusProjects] =
    useState<GropiusProject[]>(undefined);
  const [gropiusComponents, setGropiusComponents] =
    useState<GropiusComponent[]>(undefined);
  const [alarmActions, setAlarmActions] = useState<string[]>([]);
  const router = useHistory();

  useEffect(() => {
    fetchTargets(SELECTED_ENV).then((res) => setTargets(res));
    fetchGropiusProjects().then((res) => {
      setGropiusProjects(res);
    });
    fetchAlarmActionList(SELECTED_ENV).then((res) => setAlarmActions(res));
  }, []);

  const defaultValues: SloRule = {
    name: "",
    description: "",

    deploymentEnvironment: SELECTED_ENV,
    targetId: undefined,
    gropiusProjectId: SELECTED_GROPIUS_PROJECT_ID,
    gropiusComponentId: undefined,

    preset: PresetOption.CUSTOM,
    metricOption: MetricOption.PROBE_SUCCESS,
    comparisonOperator: ComparisonOperator.LESS,
    statistic: StatisticsOption.AVG,

    threshold: undefined,
    period: undefined,
  };

  return (
    <Container>
      <Card>
        <Box p={2}>
          <Formik
            initialValues={defaultValues}
            validationSchema={Yup.object({
              // TODO: comprehensive validation
              name: Yup.string().required("Required"),
              threshold: Yup.string().required("Required"),
              period: Yup.string().required("Required"),
            })}
            onSubmit={async (values) => {
              console.log("Submitting", values);
              await postRule(values);
              router.push("/");
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

                <p>Environment</p>
                <FormControl fullWidth>
                  <InputLabel
                    style={{ marginLeft: "16px" }}
                    id="deploymentEnvironment"
                  >
                    Deployment Environment
                  </InputLabel>
                  <Field
                    component={Select}
                    type="checkbox"
                    fullWidth
                    variant="outlined"
                    label="deploymentEnvironment"
                    name="deploymentEnvironment"
                    placeholder="Select a deployment environment..."
                    // defaultValue=""
                    onChange={(e) => {
                      setFieldValue("deploymentEnvironment", e.target.value);
                      fetchTargets(e.target.value).then((res) =>
                        setTargets(res)
                      );
                      fetchAlarmActionList(e.target.value).then((res) =>
                        setAlarmActions(res)
                      );
                    }}
                  >
                    {Object.values(DeploymentEnvironment).map((value) => (
                      <ListItem key={value} value={value}>
                        {value}
                      </ListItem>
                    ))}
                  </Field>
                </FormControl>

                {targets && (
                  <FormControl fullWidth>
                    <InputLabel style={{ marginLeft: "16px" }} id="targetId">
                      Target
                    </InputLabel>
                    <Field
                      component={Select}
                      type="checkbox"
                      fullWidth
                      variant="outlined"
                      label="Target"
                      name="targetId"
                    >
                      {targets?.map((target) => (
                        <ListItem key={target.targetId} value={target.targetId}>
                          {target.targetName}
                        </ListItem>
                      ))}
                    </Field>
                  </FormControl>
                )}

                {values.deploymentEnvironment === DeploymentEnvironment.AWS && (
                  <FormControl fullWidth>
                    <InputLabel
                      style={{ marginLeft: "16px" }}
                      id="alertTopicArn"
                    >
                      Alarm Action
                    </InputLabel>
                    <Field
                      component={Select}
                      type="checkbox"
                      fullWidth
                      variant="outlined"
                      label="Alarm Action"
                      name="alertTopicArn"
                    >
                      {alarmActions?.map((alarm) => (
                        <ListItem key={alarm} value={alarm}>
                          {alarm}
                        </ListItem>
                      ))}
                    </Field>
                  </FormControl>
                )}

                <FormControl fullWidth>
                  <InputLabel
                    style={{ marginLeft: "16px" }}
                    id="gropiusProjectId"
                  >
                    Gropius Project
                  </InputLabel>
                  <Field
                    component={Select}
                    type="checkbox"
                    fullWidth
                    variant="outlined"
                    label="Gropius Project"
                    name="gropiusProjectId"
                    onChange={(e) => {
                      setFieldValue("gropiusProjectId", e.target.value);
                      fetchGropiusComponents(e.target.value).then((res) =>
                        setGropiusComponents(res)
                      );
                    }}
                  >
                    {gropiusProjects?.map((project) => (
                      <ListItem key={project.id} value={project.id}>
                        {project.name}
                      </ListItem>
                    ))}
                  </Field>
                </FormControl>

                {gropiusComponents && (
                  <FormControl fullWidth>
                    <InputLabel
                      style={{ marginLeft: "16px" }}
                      id="gropiusComponentId"
                    >
                      Gropius Component
                    </InputLabel>
                    <Field
                      component={Select}
                      type="checkbox"
                      fullWidth
                      variant="outlined"
                      label="Gropius Component"
                      name="gropiusComponentId"
                    >
                      {gropiusComponents?.map((component) => (
                        <ListItem key={component.id} value={component.id}>
                          {component.name}
                        </ListItem>
                      ))}
                    </Field>
                  </FormControl>
                )}

                <p>Properties</p>
                {/* <Field
                  component={Select}
                  type="checkbox"
                  fullWidth
                  variant="outlined"
                  label="Preset"
                  name="preset"
                  onChange={(e) => {
                    if (e.target.value === PresetOption.AVAILABILITY) {
                      setFieldValue("preset", PresetOption.AVAILABILITY);
                      setFieldValue("metricOption", MetricOption.PROBE_SUCCESS);
                      setFieldValue("operator", ComparisonOperator.LESS);
                      setFieldValue("function", StatisticsOption.AVG);
                    } else if (e.target.value === PresetOption.RESPONSE_TIME) {
                      setFieldValue("preset", PresetOption.RESPONSE_TIME);
                      setFieldValue("metricOption", MetricOption.RESPONSE_TIME);
                      setFieldValue("operator", ComparisonOperator.GREATER);
                      setFieldValue("function", StatisticsOption.AVG);
                    } else {
                      setFieldValue("preset", PresetOption.CUSTOM);
                    }
                  }}
                >
                  {Object.values(PresetOption).map((value) => (
                    <ListItem key={value} value={value}>
                      {value}
                    </ListItem>
                  ))}
                </Field> */}

                {values.preset === PresetOption.CUSTOM && (
                  <FormControl fullWidth>
                    <InputLabel
                      style={{ marginLeft: "16px" }}
                      id="metricOption"
                    >
                      Metric Option
                    </InputLabel>
                    <Field
                      component={Select}
                      type="checkbox"
                      fullWidth
                      variant="outlined"
                      label="Metric"
                      name="metricOption"
                    >
                      {Object.values(MetricOption).map((value) => (
                        <ListItem key={value} value={value}>
                          {value}
                        </ListItem>
                      ))}
                    </Field>
                  </FormControl>
                )}

                {values.preset === PresetOption.CUSTOM && (
                  <FormControl fullWidth>
                    <InputLabel style={{ marginLeft: "16px" }} id="operator">
                      Operator
                    </InputLabel>
                    <Field
                      component={Select}
                      type="checkbox"
                      fullWidth
                      variant="outlined"
                      label="Operator"
                      name="operator"
                    >
                      {Object.values(ComparisonOperator).map((value) => (
                        <ListItem key={value} value={value}>
                          {value}
                        </ListItem>
                      ))}
                    </Field>
                  </FormControl>
                )}

                {values.preset === PresetOption.CUSTOM && (
                  <FormControl fullWidth>
                    <InputLabel style={{ marginLeft: "16px" }} id="function">
                      Function
                    </InputLabel>
                    <Field
                      component={Select}
                      type="checkbox"
                      fullWidth
                      variant="outlined"
                      label="Function"
                      name="function"
                    >
                      {Object.values(StatisticsOption).map((value) => (
                        <ListItem key={value} value={value}>
                          {value}
                        </ListItem>
                      ))}
                    </Field>
                  </FormControl>
                )}

                <Field
                  component={TextField}
                  fullWidth
                  variant="outlined"
                  label="period"
                  name="period"
                  type="number"
                  placeholder="period"
                ></Field>

                <Field
                  component={TextField}
                  fullWidth
                  variant="outlined"
                  label="threshold"
                  name="threshold"
                  type="number"
                  placeholder="Threshold"
                ></Field>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSubmit()}
                >
                  Save
                </Button>
              </div>
            )}
          </Formik>
        </Box>
      </Card>
    </Container>
  );
}
