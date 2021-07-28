import { HttpModule, Logger, Module } from '@nestjs/common';
import { SolomonApi } from './solomon-api.controller';
import { ForwarderModule } from './forwarder/forwarder.module';
import { ConnectorAzureModule } from './connector-azure/connector-azure.module';
import { ConnectorCloudwatchModule } from './connector-cloudwatch/connector-cloudwatch.module';
import { ConnectorKubernetesModule } from './connector-kubernetes/connector-kubernetes.module';
import { AlertHandlerModule } from './alert-handler/alert-handler.module';
import { GropiusModule } from './gropius-manager/gropius-manager.module';
import { ConfigModule } from '@nestjs/config';

// this env var is set in the start script of package.json (either 'local' or 'aws')
const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: !ENV ? './config/envs/.env.dev.local' : `./config/envs/.env.dev.${ENV}` , isGlobal: true }),
    HttpModule,
    ForwarderModule,
    ConnectorAzureModule,
    ConnectorCloudwatchModule,
    ConnectorKubernetesModule,
    AlertHandlerModule,
    GropiusModule,
  ],
  controllers: [SolomonApi],
  providers: [Logger],
})
export class AppModule {}