import { Module } from '@nestjs/common';
import { GropiusModule } from 'src/gropius-manager/gropius-manager.module';
import { AlertHandlerService } from './alert-handler.service';
import { AlertApi } from './alert-api.controller';

@Module({
  imports: [GropiusModule],
  providers: [AlertHandlerService],
  exports: [AlertHandlerService],
  controllers: [AlertApi]
})
export class AlertHandlerModule {}
