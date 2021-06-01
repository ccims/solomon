import { DeploymentEnvironment } from "./slo-rule.model";

export interface SolomonInstanceConfig {
    gropiusProjectId: string;
    deploymentEnvironment: DeploymentEnvironment;
}