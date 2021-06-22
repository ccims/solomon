import { Module } from '@nestjs/common';
import { GropiusModule } from 'src/gropius-manager/gropius-manager.module';
import { AlertHandlerService } from './alert-handler.service';
import { AlertController } from './alert.controller';

@Module({
  imports: [GropiusModule],
  providers: [AlertHandlerService],
  exports: [AlertHandlerService],
  controllers: [AlertController]
})
export class AlertHandlerModule {}
