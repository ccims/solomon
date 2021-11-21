import { Injectable, Logger } from '@nestjs/common';
import { ConnectorService } from 'src/models/connector-service';
import { CwConnectorService } from 'src/connector-cloudwatch/cw.service';
import { DeploymentEnvironment, Slo, Target } from 'solomon-models';
import { K8sConnectorService } from 'src/connector-kubernetes/k8s.service';
import { TargetType } from 'solomon-models/dist/target.model';
import K8sEnvironment, { K8sDeployment } from 'src/connector-kubernetes/k8s-environment.interface';
import { K8sDeploymentService } from 'src/connector-kubernetes/k8s-deployments.service';

/**
 * The forwarder service contains the logic for **forwarding the requests** (e.g. getSlos, addSlo) 
 * that arrive at the app controller **to the respective connectors** that are used to connect 
 * to **different monitoring tools** (e.g. AWS: CloudWatch, Kubernetes: Prometheus).
 */
@Injectable()
export class ForwarderService implements ConnectorService {
    private readonly logger = new Logger(ForwarderService.name);

    constructor(private cwConnector: CwConnectorService,
        private k8sConnector: K8sConnectorService, private k8sDeployment: K8sDeploymentService) { }


    getSlos(deploymentEnvironment: DeploymentEnvironment): Promise<Slo[]> {
        switch (deploymentEnvironment) {
            case DeploymentEnvironment.AWS:
                return this.cwConnector.getSlos();
            case DeploymentEnvironment.KUBERNETES:
                return this.k8sConnector.getSlos();
        }
    }

    getSlo(sloId: string, deploymentEnvironment: DeploymentEnvironment) {
        switch (deploymentEnvironment) {
            case DeploymentEnvironment.AWS:
                return this.cwConnector.getSlo(sloId);
            case DeploymentEnvironment.KUBERNETES:
                return this.k8sConnector.getSlo(sloId);
        }
    }

    getTargets(deploymentEnvironment: DeploymentEnvironment, targetType?: TargetType): Promise<Target[]> {
        switch (deploymentEnvironment) {
            case DeploymentEnvironment.AWS:
                return this.cwConnector.getTargets(null, targetType);
            case DeploymentEnvironment.KUBERNETES:
                this.logger.log('not yet implemented ...')
                return this.k8sConnector.getTargets();
        }
    }

    getAlarmActions(deploymentEnvironment: DeploymentEnvironment): Promise<string[]> {
        switch (deploymentEnvironment) {
            case DeploymentEnvironment.AWS:
                return this.cwConnector.getAlarmActions();
            case DeploymentEnvironment.KUBERNETES:
                this.logger.log('not implemented ...')
                return null;
            // probably not needed for Kubernetes
        }
    }

    addSLO(slo: Slo): Promise<boolean> {
        switch (slo.deploymentEnvironment) {
            case DeploymentEnvironment.AWS:
                return this.cwConnector.addSLO(slo);
            case DeploymentEnvironment.KUBERNETES:
                return this.k8sConnector.addSLO(slo);
        }
    }

    updateSlo(slo: Slo): Promise<boolean> {
        switch (slo.deploymentEnvironment) {
            case DeploymentEnvironment.AWS:
                return this.cwConnector.updateSlo(slo);
            case DeploymentEnvironment.KUBERNETES:
                return this.k8sConnector.updateSlo(slo);
        }
    }

    deleteSlo(id: string, env: DeploymentEnvironment): Promise<boolean> {
        switch (env) {
            case DeploymentEnvironment.AWS:
                return this.cwConnector.deleteSlo(id);
            case DeploymentEnvironment.KUBERNETES:
                return this.k8sConnector.deleteSlo(id);
        }
    }

    createEnvironment(env: K8sEnvironment) {
        return this.k8sDeployment.createEnvironment(env);
    }

    getEnvironments() {
        return this.k8sDeployment.getEnvironments();
    }

    toggleDeployment(environment: K8sEnvironment, deployment: K8sDeployment) {
        return this.k8sDeployment.toggleDeploymentOnOff(environment, deployment);
    }

}
