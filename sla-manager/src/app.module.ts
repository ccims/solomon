import { HttpModule, Logger, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { SlaRulesService } from './sla-rules.service';
import { IssueManagerService } from './issue-manager/issue-manager.service';
import { IssueManagerController } from './issue-manager/issue-manager.controller';
import * as winston from 'winston';


@Module({
  imports: [
    HttpModule,
    // WinstonModule.forRoot({
    //   transports: [
    //     new winston.transports.Console(),
    //   ]
    // })
  ],
  controllers: [AppController, IssueManagerController],
  providers: [Logger, SlaRulesService, IssueManagerService],
})
export class AppModule {}
