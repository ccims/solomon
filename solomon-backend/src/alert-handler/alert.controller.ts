import { Body, Controller, Get, Header, Logger, Post } from '@nestjs/common';
import { AlertHandlerService } from './alert-handler.service';

@Controller('alert')
export class AlertController {
    private readonly logger = new Logger(AlertController.name);

    constructor(private alertService: AlertHandlerService) {}

    @Get()
    welcome(){
        return 'Welcome on the cw-alert page'
    }

    @Post('aws')
    receiveCwAlert(@Body() cwAlert) {
        this.logger.log('called receiveCwAlert')
        return this.alertService.handleCwAlert(cwAlert);
    }

    @Post('kubernetes')
    receivePrometheusAlert(@Body() alert) {
        this.logger.log('called receivePrometheusAlert')
        return this.alertService.handlePrometheusAlert(alert);
    }
}