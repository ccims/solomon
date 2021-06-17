import { Module } from '@nestjs/common';
import { AlertHandlerService } from './alert-handler.service';

@Module({
  providers: [AlertHandlerService],
  exports: [AlertHandlerService]
})
export class AlertHandlerModule {}
