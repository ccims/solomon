import { Box, Button, Card, Container } from "@material-ui/core";
import { Field, FieldArray, Formik } from "formik";
import { TextField } from "formik-material-ui";
import { useEffect, useState } from "react";
import { GropiusProject } from "solomon-models";
import {
  createEnvironment,
  fetchEnvironment,
  fetchGropiusProjectsFull,
  toggleDeployment,
} from "../../../api";
import GropiusDeploymentDialog from "../../shared/gropius-deployment-dialog";

export default function DeploymentsPage() {
  const [projects, setProjects] = useState<GropiusProject[]>();
  const [environments, setEnvironments] = useState<any[]>();

  useEffect(() => {
    fetchGropiusProjectsFull().then((res) => setProjects(res));
    fetchEnvironment().then((res) => setEnvironments(res));
  }, []);


  return (
    <Container>
      { projects && <GropiusDeploymentDialog projects={projects} />}
      {environments?.map((env, index) => (
        <Card style={{ padding: "16px", marginTop: "16px" }} key={env.index}>
          <h2>Environment: {env.name}</h2>
          {env.deployments?.map((deployment) => (
            <div key={deployment.name} style={{ display: "flex" }}>
              <p style={{ flexGrow: 1 }}>{deployment.name ?? "No Name"} (Active replicas: {deployment.replicas ?? "No Replicas"})</p>
              <Button
                variant="contained"
                onClick={async () => {
                  const res = await toggleDeployment(env, deployment);
                  setEnvironments(res);
                }}
              >
                { deployment.replicas === 0 ? 'Turn On' : 'Turn off'}
              </Button>
            </div>
          ))}
        </Card>
      ))}
    </Container>
  );
}
