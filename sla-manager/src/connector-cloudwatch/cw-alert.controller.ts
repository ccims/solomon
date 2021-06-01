import { Body, Controller, Get, Header, Logger, Post } from '@nestjs/common';
import { CwAlertService } from './cw-alert.service';

@Controller('cw-alert')
export class CwAlertController {
    private readonly logger = new Logger(CwAlertController.name);

    constructor(private alertService: CwAlertService) {}

    @Get()
    welcome(){
        return 'Welcome on the cw-alert page'
    }

    @Post('subscription')
    @Header('x-amz-sns-message-type','SubscriptionConfirmation ')
    confirmSubscription(@Body() snsMessage) {
        this.logger.log(snsMessage)
        this.logger.log(snsMessage.Message)
        this.logger.log(snsMessage.SubscribeURL) //must be visited to confirm subscription..send GET request to URL
        return this.alertService.confirmSubscription(snsMessage);
    }

    @Post('notification')
    @Header('x-amz-sns-message-type','Notification ')
    receiveNotification(@Body() snsMessage) {
        this.logger.log(snsMessage.Message)
        this.logger.log(snsMessage.Subject)
        return this.alertService.receiveNotification(snsMessage);
    }
}
