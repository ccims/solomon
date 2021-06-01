export interface SolomonInstanceConfig {
    gropiusProjectId: string;
    deploymentEnvironment: DeploymentEnvironment;
}

export enum DeploymentEnvironment {
    AWS = 'aws',
    KUBERNETES = 'kubernetes',
}