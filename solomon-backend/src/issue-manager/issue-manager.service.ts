import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { GropiusIssue } from '../models/issue.model';
import { K8sConnectorService } from '../connector-kubernetes/k8s.service';
import { request, gql } from 'graphql-request';

@Injectable()
export class IssueManagerService {
    
    gropiusApiUrl = "http://localhost:8080/api"

    alerts: any[] = [];

    constructor(private slaService: K8sConnectorService, @Inject(Logger) private readonly logger: LoggerService) {}

    addAlert(alert) {
      this.alerts.push(alert);
    }

    handleAlerts(alerts: any[]) {
        alerts.forEach(alert => {
            this.handleIssue(alert);
        });
    }

    async handleIssue(alert) {
        
        const slaId = alert.annotations.slaRuleId;
        const targetService = alert.labels.target;

        if (!slaId) {
            this.logger.debug(`dismissing issue, no id. name: ${alert.labels.alertname} service: ${targetService}`);
            return;
        }

        const slaRule = await this.slaService.getRule(slaId);

        if (!slaRule) {
            this.logger.debug(`dismissing issue, no rule found to id ${slaId}`)
            return;
        }
        
        const componentId = Object.keys(slaRule.gropiusTargets).find((key) => slaRule.gropiusTargets[key] === targetService);

        if (!componentId) {
            this.logger.debug(`dismissing issue, ${targetService} is not registered as a componentId, registered componentIds: ${slaRule.gropiusTargets}`);
            return;
        }

        this.logger.debug(`reporting Issue ${slaRule.name} for Service ${targetService} with gropius id ${componentId}`);

        this.reportToGropius(slaRule, componentId)
    }

    async reportToGropius(slaRule, componentId) {
        const issue: GropiusIssue = {
            title: slaRule.name,
            body: slaRule.description,
            componentIDs: [ componentId ],
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
            this.logger.debug("CREATED ISSUE", issueID);
            return issueID;
        } catch (error) {
            this.logger.error("ERROR CREATING ISSUE", error);
        }
    }
}
