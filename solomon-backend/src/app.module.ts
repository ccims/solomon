import { HttpModule, Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ForwarderModule } from './forwarder/forwarder.module';
import { ConnectorAzureModule } from './connector-azure/connector-azure.module';
import { ConnectorCloudwatchModule } from './connector-cloudwatch/connector-cloudwatch.module';
import { ConnectorKubernetesModule } from './connector-kubernetes/connector-kubernetes.module';
import { AlertHandlerModule } from './alert-handler/alert-handler.module';
import { GropiusModule } from './gropius-manager/gropius-manager.module';

@Module({
  imports: [
    HttpModule,
    ForwarderModule,
    ConnectorAzureModule,
    ConnectorCloudwatchModule,
    ConnectorKubernetesModule,
    AlertHandlerModule,
    GropiusModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule {}
