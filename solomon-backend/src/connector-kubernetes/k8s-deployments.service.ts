import { HttpException, Injectable, Logger } from "@nestjs/common";
import * as k8s from '@kubernetes/client-node';
import K8sMapper from "./k8s.mapper";
import K8sEnvironment, { K8sDeployment } from "./k8s-environment.interface";



/**
 * Handles the automatic deployment to a kubernetes cluster based on specified K8sEnvironment objects
 */
@Injectable()
export class K8sDeploymentService {

    private k8sClientApi: k8s.KubernetesObjectApi;
    private k8sAppsApi: k8s.AppsV1Api;
    private k8sCoreApi: k8s.CoreV1Api;

    private readonly logger = new Logger(K8sDeploymentService.name);

    constructor() {
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        this.k8sClientApi = k8s.KubernetesObjectApi.makeApiClient(kc);
        this.k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
        this.k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
    }

    /**
     * deploys a K8sEnvironment to the kubernetes cluster
     * 
     * @param environment that should be deployed
     * @returns a promise to await the deployment
     */
    async createEnvironment(environment: K8sEnvironment) {
        try {
            await this.createNamespace(environment.name);
        } catch (error) {
            this.logger.error("Error creating namespace", error);
        }
        try {
            return Promise.all(environment.deployments?.map((deployment) => this.applyResource(deployment, environment.name)));
        } catch (error) {
            this.logger.error("Error applying resources", error);
        }
    }

    /**
     * applies a deployment and a service resource to kubernetes for the specifies deployment
     * 
     * @param deployment that should be created
     * @param namespace that the deployment should be applied to
     * @returns a promise
     */
    private async applyResource(deployment: K8sDeployment, namespace: string): Promise<any> {
        return Promise.all([
            this.k8sClientApi.create(K8sMapper.createDeploymentResourceFromK8sDeployment(deployment, namespace)),
            this.k8sClientApi.create(K8sMapper.createServiceResourceFromK8sDeployment(deployment, namespace)),
        ]);
    }

    /**
     * created a new Kubernetes namespace
     * 
     * @param name of the to be deployed namespace
     */
    private createNamespace(name: string) {
        return this.k8sClientApi.create({
            apiVersion: "v1",
            kind: "Namespace",
            metadata: {
                name: name,
                labels: {
                    "solomon-deployed": "true",
                }
            },
        });
    }

    /**
     * Scales the pods of a deployment to 0 or to the original configured replicas based on if the deployment has currently active (not 0 pods) or inactive (0 pods)
     * 
     * @param environment that should be scaled
     * @param deployment the deployment of the specified environment that should be scaled
     * @returns the updated deployed environments
     */
    public async toggleDeploymentOnOff(environment: K8sEnvironment, deployment: K8sDeployment) {
        
        try {
            const deploymentResource = await this.k8sAppsApi.readNamespacedDeployment(deployment.name, environment.name);
            if (deploymentResource.body.spec.replicas > 0) {
                deploymentResource.body.spec.replicas = 0;
            } else {
                try {
                    const replicas = parseInt(deploymentResource.body.metadata.labels["solomon-original-replicas"]);
                    if (!Number.isNaN(replicas)) {
                        deploymentResource.body.spec.replicas = replicas;
                    } else {
                        deploymentResource.body.spec.replicas = 2;
                    }
                } catch (error) {
                    deploymentResource.body.spec.replicas = 2;
                    this.logger.error("Error Rescaling", error);
                }
            }
            await this.k8sAppsApi.replaceNamespacedDeployment(
                deployment.name,
                environment.name,
                deploymentResource.body
            );

            return this.getEnvironments();
        } catch (error) {
            this.logger.error(error);
            return [];
        }
    }

    /**
     * Fetches all deployed Kubernetes namespaces with its deployments and maps it to the K8sEnvironment format
     * 
     * @returns a Promise of all deployed K8sEnvironments
     */
    async getEnvironments(): Promise<K8sEnvironment[]> {
        try {
            const namespaces = await this.k8sCoreApi.listNamespace();
            const solomonNamespaces = namespaces.body.items.filter(namespace => namespace.metadata.labels["solomon-deployed"] === "true");

            return Promise.all(
                solomonNamespaces.map(async (namespace) => {
                    const deployments = await this.k8sAppsApi.listNamespacedDeployment(namespace.metadata.name);
                    const environment: K8sEnvironment = {
                        name: namespace.metadata.name,
                        deployments: deployments.body.items.map((item) => K8sMapper.mapK8sDeployment(item))
                    }
                    return environment;
                })
            )
        } catch (error) {
            console.log(error.body)
        }
    }
}