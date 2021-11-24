export default interface K8sEnvironment {
    name: string;
    deployments?: K8sDeployment[];
    services?: K8sService[];
}

export interface K8sDeployment {
    name: string;
    image: string;
    port: number;
    replicas?: number;
}

export interface K8sService {
    name: string;
}