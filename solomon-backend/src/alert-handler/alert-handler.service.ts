import { Injectable, Logger } from '@nestjs/common';
import { GropiusManager } from 'src/gropius-manager/gropius-manager.service';
import { Alert } from '../models/alert.interface';


@Injectable()
export class AlertHandlerService {
    private readonly logger = new Logger(AlertHandlerService.name);

    private alertQueue: Alert[] = [];

    constructor(private gropiusManager: GropiusManager) {}


    addAlertToQueue(alert: Alert) {
        this.alertQueue.push(alert);
    }

    async handleAlertsFromQueue() {
        while(this.alertQueue.length > 0){
            const alert = this.alertQueue.shift()

            // TODO: fetch the right alarm, map it to sloRule
            const sloRule = null;

            this.gropiusManager.createGropiusIssue(sloRule, alert);
        }
    }

    // COPIED FROM OLD ISSUE-MANAGER:

    // async handleIssue(alert) {
        
    //     const slaId = alert.annotations.slaRuleId;
    //     const targetService = alert.labels.target;

    //     if (!slaId) {
    //         this.logger.debug(`dismissing issue, no id. name: ${alert.labels.alertname} service: ${targetService}`);
    //         return;
    //     }

    //     const slaRule = await this.slaService.getRule(slaId);

    //     if (!slaRule) {
    //         this.logger.debug(`dismissing issue, no rule found to id ${slaId}`)
    //         return;
    //     }
        
    //     const componentId = Object.keys(slaRule.gropiusTargets).find((key) => slaRule.gropiusTargets[key] === targetService);

    //     if (!componentId) {
    //         this.logger.debug(`dismissing issue, ${targetService} is not registered as a componentId, registered componentIds: ${slaRule.gropiusTargets}`);
    //         return;
    //     }

    //     this.logger.debug(`reporting Issue ${slaRule.name} for Service ${targetService} with gropius id ${componentId}`);

    //     this.reportToGropius(slaRule, componentId)
    // }

    handleCwAlert(event: any) {
        this.logger.debug(event);
        return true;
    }

    handlePrometheusAlert(alert: any) {
        // TODO
    }

    

}
