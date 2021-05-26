import { HttpModule, Module } from '@nestjs/common';
import { CwConnectorService } from './cw.service';
import { CwAlertController } from './cw-alert.controller';
import { CwAlertService } from './cw-alert.service';

@Module({
    imports: [HttpModule],
    providers: [CwConnectorService, CwAlertService],
    exports: [CwConnectorService],
    controllers: [CwAlertController]
})
export class ConnectorCloudwatchModule {}
