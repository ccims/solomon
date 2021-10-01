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
import React, { useEffect, useState, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import XmlConverterService from "../../../xml-converter/xml-converter.service";


import {
  ComparisonOperator,
  DeploymentEnvironment,
  GropiusComponent,
  GropiusProject,
  MetricOption,
  PresetOption,
  Slo,
  StatisticsOption,
  Target,
  TargetType,
} from "solomon-models";
import * as Yup from "yup";
import {
  addRule,
  deleteRule,
  fetchAlarmActionList,
  fetchGropiusComponents,
  fetchGropiusProjects,
  fetchRule,
  fetchTargets,
  updateRule,
} from "../../../api";
import { SELECTED_ENV } from "../../../App";
import { ValuesOfCorrectTypeRule } from "graphql";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

export default function SloEditPage() {
  const classes = useStyles();

  const { ruleId } = useParams<any>();

  const [rule, setRule] = useState<Slo>();

  const [targets, setTargets] = useState<Target[]>(undefined);
  const [gropiusProjects, setGropiusProjects] =
    useState<GropiusProject[]>(undefined);
  const [gropiusComponents, setGropiusComponents] =
    useState<GropiusComponent[]>(undefined);
  const [alarmActions, setAlarmActions] = useState<string[]>([]);
  const router = useHistory();

  const inputFile = useRef(null);
  const conv = new XmlConverterService();
  const reader = new FileReader()


  const defaultValues: Slo = {
    name: "",
    description: "",

    deploymentEnvironment: SELECTED_ENV,
    targetId: undefined,
    gropiusProjectId: undefined,
    gropiusComponentId: undefined,

    preset: PresetOption.CUSTOM,
    metricOption: MetricOption.PROBE_SUCCESS,
    comparisonOperator: ComparisonOperator.LESS,
    statistic: StatisticsOption.AVG,

    threshold: undefined,
    period: undefined,
  };

  useEffect(() => {
    if (ruleId) {
      fetchRule(ruleId, SELECTED_ENV).then((res) => setRule(res));
    } else {
      setRule(defaultValues);
    }
  }, [ruleId]);

  useEffect(() => {
    if (rule) {
      fetchTargets(rule.deploymentEnvironment, rule.targetType).then((res) =>
        setTargets(res)
      );
      fetchGropiusProjects().then((res) => {
        setGropiusProjects(res);
      });
      if (rule.gropiusProjectId) {
        fetchGropiusComponents(rule.gropiusProjectId).then((res) =>
          setGropiusComponents(res)
        );
      }
      fetchAlarmActionList(rule.deploymentEnvironment).then((res) =>
        setAlarmActions(res)
      );
    }
  }, [rule]);

  async function onDeleteRule() {
    if (rule?.id) {
      await deleteRule(rule.id, rule.deploymentEnvironment);
      router.push("/");
    }
  }

  async function onUploadXML() {
    
    inputFile.current.click();
  }

  return (
    <Container>
      {rule ? (
        <Card>
          <Box p={2}>
            <Formik
              initialValues={rule}
              enableReinitialize
              validationSchema={Yup.object({
                // TODO: comprehensive validation
                name: Yup.string().required("Required"),
                threshold: Yup.string().required("Required"),
                period: Yup.string().required("Required"),
              })}
              onSubmit={async (values) => {
                console.log("Submitting", values);
                if (values.id) {
                  await updateRule(values);
                } else {
                  await addRule(values);
                }
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
                        fetchTargets(e.target.value, values.targetType).then(
                          (res) => setTargets(res)
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

                  {values.deploymentEnvironment ===
                    DeploymentEnvironment.AWS && (
                    <FormControl fullWidth>
                      <InputLabel
                        style={{ marginLeft: "16px" }}
                        id="targetType"
                      >
                        Target Type
                      </InputLabel>
                      <Field
                        component={Select}
                        type="checkbox"
                        fullWidth
                        variant="outlined"
                        label="Target Type"
                        name="targetType"
                        onChange={(e) => {
                          setFieldValue("targetType", e.target.value);
                          fetchTargets(
                            values.deploymentEnvironment,
                            e.target.value
                          ).then((res) => setTargets(res));
                        }}
                      >
                        {Object.values(TargetType).map((value) => (
                          <ListItem key={value} value={value}>
                            {value}
                          </ListItem>
                        ))}
                      </Field>
                    </FormControl>
                  )}

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
                          <ListItem
                            key={target.targetName}
                            value={target.targetName}
                          >
                            {target.targetName}
                          </ListItem>
                        ))}
                      </Field>
                    </FormControl>
                  )}

                  {values.deploymentEnvironment ===
                    DeploymentEnvironment.AWS && (
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

                  {(!values.preset ||
                    values.preset === PresetOption.CUSTOM) && (
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

                  {(!values.preset ||
                    values.preset === PresetOption.CUSTOM) && (
                    <FormControl fullWidth>
                      <InputLabel style={{ marginLeft: "16px" }} id="function">
                        Statistic
                      </InputLabel>
                      <Field
                        component={Select}
                        type="checkbox"
                        fullWidth
                        variant="outlined"
                        label="Statistic"
                        name="statistic"
                      >
                        {Object.values(StatisticsOption).map((value) => (
                          <ListItem key={value} value={value}>
                            {value}
                          </ListItem>
                        ))}
                      </Field>
                    </FormControl>
                  )}

                  {(!values.preset ||
                    values.preset === PresetOption.CUSTOM) && (
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
                        name="comparisonOperator"
                      >
                        {Object.values(ComparisonOperator).map((value) => (
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
                    label="threshold"
                    name="threshold"
                    type="number"
                    placeholder="Threshold"
                  ></Field>

                  <Field
                    component={TextField}
                    fullWidth
                    variant="outlined"
                    label="period"
                    name="period"
                    type="number"
                    placeholder="period"
                  ></Field>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSubmit()}
                  >
                    Save
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onUploadXML()}
                  >
                    Upload XML
                  </Button>
                  <input type='file' accept='.xml' id='file' style={{display: 'none'} } ref={inputFile} onChange={(e) => 
                    {reader.onload = async (e) => { 
                      const text = (e.target.result);
                      var promiseRule = conv.convertXml(text.toString());
                      promiseRule.then((convertedRule) => {
                      //Fill Fields with Values read from XML
                      setFieldValue("name", convertedRule.name);
                      setFieldValue("description", convertedRule.description);
                      setFieldValue("targetId", convertedRule.targetId);
                      setFieldValue("deploymentEnvironment", convertedRule.deploymentEnvironment);

                      if (convertedRule.deploymentEnvironment === DeploymentEnvironment.AWS){
                        setFieldValue("targetType", convertedRule.targetType);
                        setFieldValue("alertTopicArn", convertedRule.alertTopicArn);
                        setFieldValue("name", convertedRule.name);

                      }
                      setFieldValue("gropiusProjectId", convertedRule.gropiusProjectId);
                      fetchGropiusComponents(convertedRule.gropiusProjectId).then((res) =>
                        setGropiusComponents(res)
                      );
                      setFieldValue("gropiusComponentId", convertedRule.gropiusComponentId);
                      setFieldValue("preset", convertedRule.preset);
                      if (convertedRule.preset === PresetOption.CUSTOM){
                        setFieldValue("metricOption", convertedRule.metricOption);
                        setFieldValue("statistic", convertedRule.statistic);
                        setFieldValue("comparisonOperator", convertedRule.comparisonOperator);
                      }
                      setFieldValue("threshold", convertedRule.threshold);
                      setFieldValue("period", convertedRule.period);
                    }).catch((error) => {
                      //Alert Invalid XML Inputs
                      alert(error);
                    });
                    };
                    reader.readAsText(e.target.files[0]);}
                  }
                 />

                  {rule?.id && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => onDeleteRule()}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </Formik>
          </Box>
        </Card>
      ) : (
        <div>loading...</div>
      )}
    </Container>
  );
}
