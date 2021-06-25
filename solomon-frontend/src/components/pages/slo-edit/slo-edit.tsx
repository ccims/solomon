import {
  Box,
  Button,
  Card,
  Container,
  ListItem,
  makeStyles,
} from "@material-ui/core";
import { Field, Formik } from "formik";
import { Select, TextField } from "formik-material-ui";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
    ComparisonOperator,
  DeploymentEnvironment,
  MetricOption,
  PresetOption,
  SloRule,
  StatisticsOption,
  Target,
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
  const router = useHistory();

  useEffect(() => {
    fetchTargets(SELECTED_ENV).then((res) => setTargets(res));
    fetchGropiusComponents(SELECTED_GROPIUS_PROJECT_ID).then((res) =>
      setGropiusComponents(res)
    );
  }, []);

  const defaultValues: SloRule = {
    name: "",
    description: "",

    deploymentEnvironment: DeploymentEnvironment.KUBERNETES,
    targetId: "",
    gropiusProjectId: "",
    gropiusComponentId: "",

    preset: PresetOption.AVAILABILITY,
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

                {/* TODO: */}
                {/* <Field
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
                </Field> */}

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
                </Field>

                {values.preset === PresetOption.CUSTOM && (
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
                )}

                {values.preset === PresetOption.CUSTOM && (
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
                )}

                {values.preset === PresetOption.CUSTOM && <Field
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
                </Field>}

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
