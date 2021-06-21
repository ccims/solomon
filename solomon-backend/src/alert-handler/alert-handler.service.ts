import { Injectable, Logger } from '@nestjs/common';
import {request, gql } from 'graphql-request';
import { GropiusIssue } from 'src/models/gropius.model';
import SloRule from 'src/models/slo-rule.model';
import { Alert } from './alert.interface';


@Injectable()
export class AlertHandlerService {
    private readonly logger = new Logger(AlertHandlerService.name);

    private gropiusApiUrl = "http://localhost:8080/api"

    private alertQueue: Alert[] = [];

    constructor() {}


    addAlertToQueue(alert: Alert) {
        this.alertQueue.push(alert);
    }

    async handleAlertsFromQueue() {
        while(this.alertQueue.length > 0){
            const alert = this.alertQueue.shift()

            // TODO: fetch the right alarm, map it to sloRule
            const sloRule = null;

            this.createGropiusIssue(sloRule, alert);
        }
    }

    async createGropiusIssue(sloRule: SloRule, alert: Alert) {
        const issue: GropiusIssue = {
            title: sloRule.name,
            body: sloRule.description,
            componentIDs: [ sloRule.targetId ],
        }

        const queryIssue = gql`
            mutation createIssue($input: CreateIssueInput!) {
                createIssue(input: $input) {
                    issue {
                        id
                    }
                }
            }
        `;

        try {
            const data = await request(this.gropiusApiUrl, queryIssue, { input: issue});
            const issueID = data.createIssue.issue.id;
            this.logger.log("CREATED ISSUE: ", issueID);
            return issueID;
        } catch (error) {
            this.logger.log("ERROR CREATING ISSUE: ", error);
        }
    }

}
