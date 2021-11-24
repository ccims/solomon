import { Module } from '@nestjs/common';
import { ConnectorCloudwatchModule } from 'src/connector-cloudwatch/connector-cloudwatch.module';
import { ConnectorKubernetesModule } from 'src/connector-kubernetes/connector-kubernetes.module';
import { K8sDeploymentService } from 'src/connector-kubernetes/k8s-deployments.service';
import { ForwarderService } from './forwarder.service';

@Module({
    imports: [ConnectorCloudwatchModule, ConnectorKubernetesModule, K8sDeploymentService],
    providers: [ForwarderService],
    exports: [ForwarderService]
})
export class ForwarderModule {}
