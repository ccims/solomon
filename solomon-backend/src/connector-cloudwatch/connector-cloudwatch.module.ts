import { HttpModule, Module } from '@nestjs/common';
import { CwConnectorService } from './cw.service';
import { AlertHandlerModule } from 'src/alert-handler/alert-handler.module';

@Module({
    imports: [HttpModule, AlertHandlerModule],
    providers: [CwConnectorService],
    exports: [CwConnectorService],
})
export class ConnectorCloudwatchModule {}
