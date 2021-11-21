import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItem,
  makeStyles,
  MenuItem,
  Select,
} from "@material-ui/core";
import { Field, FieldArray, Formik } from "formik";
import { useState } from "react";
import { TextField, Checkbox } from "formik-material-ui";

import { createEnvironment } from "../../api";

const useStyles = makeStyles({
  spacing: {
    "& > *": {
      marginTop: "8px",
      marginBottom: "8px",
    },
  },
});

export default function GropiusDeploymentDialog({ projects }) {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState(projects[0]);

  const classes = useStyles();

  return (
    <div>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Deploy from Gropius
      </Button>
      <Formik
        enableReinitialize
        initialValues={{
          name: "production",
          deployments: project.components.map((component) => {
            return { name: component.name, deploy: true };
          }),
        }}
        onSubmit={(values) => {
          console.log(values);
          //   createEnvironment(values);
        }}
      >
        {(formik) => (
          <Dialog open={open} fullWidth>
            <DialogTitle>Deploy from Gropius</DialogTitle>
            <DialogContent>
              <FormControl fullWidth style={{ marginBottom: "16px" }}>
                <InputLabel id="gropiusProjectId">
                  Gropius Project to Deploy
                </InputLabel>
                <Select
                  labelId="gropiusProjectId"
                  id="gropiusProjectSelect"
                  variant="outlined"
                  fullWidth
                  value={project.id}
                  onChange={(e) => {
                    setProject(e);
                  }}
                >
                  {projects?.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box key={project.id}>
                <div>
                  <Field
                    component={TextField}
                    fullWidth
                    variant="outlined"
                    label="Environment Name"
                    name="name"
                    type="text"
                    placeholder="Name"
                  ></Field>
                  <FieldArray
                    name="deployments"
                    render={(_) => (
                      <div>
                        {project.components.map((component, index) => (
                          <div key={component.id} style={{}}>
                            <FormControlLabel
                              className="ml-0 mr-0"
                              label={`Deploy ${component.name} (Deployment & Service)`}
                              control={
                                <Field
                                  component={Checkbox}
                                  type="checkbox"
                                  fullWidth
                                  variant="outlined"
                                  name={`deployments[${index}].deploy`}
                                ></Field>
                              }
                            ></FormControlLabel>
                            {formik.values.deployments[index].deploy ===
                              true && (
                              <div className={classes.spacing}>
                                <Field
                                  component={TextField}
                                  disabled
                                  fullWidth
                                  variant="outlined"
                                  label="Name"
                                  name={`deployments[${index}].name`}
                                  type="text"
                                  placeholder="Name"
                                ></Field>
                                <Field
                                  component={TextField}
                                  fullWidth
                                  variant="outlined"
                                  label="Image"
                                  name={`deployments[${index}].image`}
                                  type="text"
                                  placeholder="Image"
                                ></Field>
                                <Field
                                  component={TextField}
                                  fullWidth
                                  variant="outlined"
                                  label="Port"
                                  name={`deployments[${index}].port`}
                                  type="number"
                                  placeholder="Port"
                                ></Field>
                                <Field
                                  component={TextField}
                                  fullWidth
                                  variant="outlined"
                                  label="Replicas"
                                  name={`deployments[${index}].replicas`}
                                  type="number"
                                  placeholder="Replicas"
                                ></Field>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  ></FieldArray>
                </div>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => formik.handleSubmit()}>Deploy</Button>
            </DialogActions>
          </Dialog>
        )}
      </Formik>
    </div>
  );
}
