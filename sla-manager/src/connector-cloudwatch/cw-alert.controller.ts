import { Body, Controller, Get, Header, Post } from '@nestjs/common';
import { CwAlertService } from './cw-alert.service';

@Controller('cw-alert')
export class CwAlertController {

    constructor(private alertService: CwAlertService) {}

    @Get()
    welcome(){
        return 'Welcome on the cw-alert page'
    }

    @Post('subscription')
    @Header('x-amz-sns-message-type','SubscriptionConfirmation ')
    confirmSubscription(@Body() snsMessage) {
        console.log(snsMessage)
        console.log(snsMessage.Message)
        console.log(snsMessage.SubscribeURL) //must be visited to confirm subscription..send GET request to URL
        return this.alertService.confirmSubscription(snsMessage);
    }

    @Post('notification')
    @Header('x-amz-sns-message-type','Notification ')
    receiveNotification(@Body() snsMessage) {
        console.log(snsMessage.Message)
        console.log(snsMessage.Subject)
        return this.alertService.receiveNotification(snsMessage);
    }
}
