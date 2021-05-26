import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class CwAlertService {

    constructor(private httpService: HttpService) {}

    confirmSubscription(snsMessage) {
        const url = snsMessage.SubscribeURL;
        const resp = this.httpService.get(url);
        return 'success';
    }

    receiveNotification(snsMessage) {
        const sub = snsMessage.Subject;
        const msg = snsMessage.Message;
        return 'success';
    }
}
