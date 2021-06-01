import { HttpService, Injectable } from '@nestjs/common';
import { AlertHandlerService } from 'src/alert-handler/alert-handler.service';

@Injectable()
export class CwAlertService {

    constructor(private httpService: HttpService, private alertHandler: AlertHandlerService) {}

    confirmSubscription(snsMessage) {
        const url = snsMessage.SubscribeURL;
        const resp = this.httpService.get(url);
        return 'success';
    }

    receiveNotification(snsMessage) {
        const sub = snsMessage.Subject;
        const msg = snsMessage.Message;

        // get alert out of message 
        
        // map alert from cw to general alert format of slo tool

        // add to queue
        this.alertHandler.addAlertToQueue(null);

        // call function to handle alert

        return 'success';
    }
}
