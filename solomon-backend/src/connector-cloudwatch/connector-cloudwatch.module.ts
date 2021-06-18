import { HttpModule, Module } from '@nestjs/common';
import { CwConnectorService } from './cw.service';
import { CwAlertController } from './cw-alert.controller';
import { CwAlertService } from './cw-alert.service';
import { AlertHandlerModule } from 'src/alert-handler/alert-handler.module';

@Module({
    imports: [HttpModule, AlertHandlerModule],
    providers: [CwConnectorService, CwAlertService],
    exports: [CwConnectorService],
    controllers: [CwAlertController]
})
export class ConnectorCloudwatchModule {}
