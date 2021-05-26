import { Module } from '@nestjs/common';
import { K8sConnectorService } from './k8s.service';

@Module({
    providers: [K8sConnectorService],
    exports: [K8sConnectorService]
})
export class ConnectorKubernetesModule {}
