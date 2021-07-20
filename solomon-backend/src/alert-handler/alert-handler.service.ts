import { Injectable, Logger } from '@nestjs/common';
import { CwAlert } from 'src/connector-cloudwatch/cw.interface';
import { CwMapper } from 'src/connector-cloudwatch/cw.rule-mapper';
import { GropiusManager } from 'src/gropius-manager/gropius-manager.service';
import { SloAlert } from '../models/alert.interface';


@Injectable()
export class AlertHandlerService {
    private readonly logger = new Logger(AlertHandlerService.name);

    private alertQueue: SloAlert[] = [];
    private deadAlertQueue: SloAlert[] = [];

    constructor(private gropiusManager: GropiusManager) {}

    /**
     * Verifies an alert and adds it to the good queue if everything is alright.
     * If the verification throws an error, the alert will be add to the deadAlertQueue.
     * @param alert alert which should be added to the alert queue
     */
    private async addAlertToQueue(alert: SloAlert) {
        try {
           await this.verifyAlert(alert);
           this.alertQueue.push(alert);
        } catch (error) {
            this.logger.error(error);
            this.deadAlertQueue.push(alert);
        }
        this.logger.debug('Length of alert queue: ' + this.alertQueue.length);
        this.logger.debug('Length of dead alert queue: ' + this.deadAlertQueue.length);
        
        await this.handleAlertsFromQueue();
        // TODO: also handle dead alert queue? or handle only when explicitly called for? special endpoint in API?
    }

    /**
     * Verifies whether all the attributes required to create a Gropius issue exist in the alert.
     * If not, errors are thrown.
     * Finally the Gropius component ID of the alert is checked against the list of existing Gropius components for the respective Gropius project ID
     * @param alert the alert which is to be verified
     * 
     * @returns true if the verification succeeds
     */
    private async verifyAlert(alert: SloAlert) {
        if(!alert.alertName){
            throw new Error('Missing Attribute! No alert name defined...')
        } else if (!alert.alertDescription) {
            throw new Error('Missing Attribute! No alert description defined...')
        } else if (!alert.gropiusComponentId) {
            throw new Error('Missing Attribute! No gropius component ID linked to SLO alarm...')
        } else if (!alert.gropiusProjectId) {
            throw new Error('Missing Attribute! No gropius project ID linked to SLO alarm...')
        }

        const projects = await this.gropiusManager.getGropiusProjects();
        if (projects.find(proj => proj.id === alert.gropiusProjectId)) {
            // everything fine
        } else {
            throw new Error('Gropius project ID mismatch! Could not find a Gropius project that mathces the project ID from the SLO alarm: ' + alert.gropiusProjectId)
        }

        const components = await this.gropiusManager.getGropiusComponents(alert.gropiusProjectId);
        if (components.find(comp => comp.id === alert.gropiusComponentId)){
            // everything fine
        } else {
            throw new Error('Gropius component ID mismatch! Could not find a gropius component that matches the component ID from the SLO alarm: ' + alert.gropiusComponentId)
        }

        this.logger.debug('Verification of SLO alert successful')
        return true;
    }

    async handleAlertsFromQueue() {
        while(this.alertQueue.length > 0){
            const alert = this.alertQueue.shift()
            try {
                this.gropiusManager.createGropiusIssue(alert);
            } catch (error) {
                this.logger.error(error)
                this.deadAlertQueue.push(alert);
            }
        }
    }

    handleCwAlert(cwAlert: CwAlert) {
        this.logger.debug(cwAlert);
        const sloAlert = CwMapper.mapCwAlertToSloAlert(cwAlert);
        this.logger.debug(sloAlert);
        this.addAlertToQueue(sloAlert);
        return true;
    }

    handlePrometheusAlert(alert: any) {
        // TODO Jonas
    }

    

}
