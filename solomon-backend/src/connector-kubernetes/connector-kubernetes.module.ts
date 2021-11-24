import { Module } from '@nestjs/common';
import { K8sDeploymentService } from './k8s-deployments.service';
import { K8sConnectorService } from './k8s.service';

@Module({
    providers: [K8sConnectorService, K8sDeploymentService],
    exports: [K8sConnectorService, K8sDeploymentService]
})
export class ConnectorKubernetesModule {}
