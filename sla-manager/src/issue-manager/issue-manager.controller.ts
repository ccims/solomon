import { Body, Controller, Get, Inject, Logger, LoggerService, Post } from '@nestjs/common';
import { IssueManagerService } from './issue-manager.service';

@Controller()
export class IssueManagerController {

    constructor(private readonly issueManager: IssueManagerService) { }

    @Get()
    getAlerts() {
        return this.issueManager.alerts;
    }

    @Post()
    postAlert(@Body() body) {
        this.issueManager.addAlert(body);
        this.issueManager.handleAlerts(body.alerts);
        return true;
    }
}
