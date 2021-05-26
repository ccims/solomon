import { Injectable } from '@nestjs/common';
import { ConnectorService } from 'src/models/connector-service';
import { CwConnectorService } from 'src/connector-cloudwatch/cw.service';
import { K8sConnectorService } from 'src/connector-kubernetes/k8s.service';
import SloRule from 'src/models/slo-rule.model';
import { MonitoringTool } from 'src/models/slo-rule.model';

/**
 * The forwarder service contains the logic for **forwarding the requests** (e.g. getRules, addRule) 
 * that arrive at the app controller **to the respective plugins** that are used to connect 
 * to **different monitoring tools** (e.g. CloudWatch, Prometheus).
 */
@Injectable()
export class ForwarderService implements ConnectorService{
    monitoringTool = MonitoringTool.CLOUDWATCH;

    constructor(private cwConnector: CwConnectorService,
                private promConnector: K8sConnectorService) {}

    setMonitoringTool(selection: MonitoringTool[]) {
        // TODO: allow multiple selections?
        this.monitoringTool = selection[0] as MonitoringTool;
        console.log('Selected the following monitoring tool:');
        console.log(this.monitoringTool);
    }

    getRules(): Promise<SloRule[]> {
        switch (this.monitoringTool) {
            case MonitoringTool.CLOUDWATCH:
                return this.cwConnector.getRules();
            case MonitoringTool.PROMETHEUS:
                console.log('not yet implemented ...')
                // return this.k8sPluginService.getRules();
        }
    }

    addRule(rule: SloRule): Promise<boolean> {
        switch (this.monitoringTool) {
            case MonitoringTool.CLOUDWATCH:
                return this.cwConnector.addRule(rule);
            case MonitoringTool.PROMETHEUS:
                // return this.k8sPluginService.addRule(rule);
        }
    }

    updateRule(rule: SloRule): Promise<boolean> {
        switch (this.monitoringTool) {
            case MonitoringTool.CLOUDWATCH:
                return this.cwConnector.updateRule(rule);
            case MonitoringTool.PROMETHEUS:
                // return this.k8sPluginService.updateRule(rule);
        }
    }

    deleteRule(name: string): Promise<boolean> {
        switch (this.monitoringTool) {
            case MonitoringTool.CLOUDWATCH:
                return this.cwConnector.deleteRule(name);
            case MonitoringTool.PROMETHEUS:
                // return this.k8sPluginService.deleteRule(rule);
        }
    }


}
