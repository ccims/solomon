import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import SlaRule, { FunctionOptions, MetricOptions, OperatorOptions, PresetOptions } from '../models/sla-rule.model';
import * as k8s from '@kubernetes/client-node';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '@nestjs/common/services/logger.service';

const testRules: SlaRule[] = [
  {
    id: "RandomlyGeneratedId",
    name: "BadAvailability",
    description: "SLA for bad availability",
    gropiusProjectId: "5d6a157f9985a001",
    gropiusTargets: {
      "5d6a15af6a05a003": "nodejs-client-service"
    },
    preset: PresetOptions.AVAILABILITY,
    metric: MetricOptions.PROBE_SUCCESS,
    operator: OperatorOptions.SMALLER_THEN,
    function: FunctionOptions.AVG_OVER_TIME,
    duration: "1m",
    value: 0.8,
  }
]

@Injectable()
export class K8sConnectorService { //implements ConnectorPluginService
  private rulesFilePath = '../rules.yaml';

  private rules: Map<string, SlaRule> = new Map()

  private kc = new k8s.KubeConfig();
  private k8Client;

  private readonly logger = new Logger(K8sConnectorService.name);
    
  constructor() {
    // Initialize Kubernetes Client
    this.kc.loadFromDefault();
    this.k8Client = k8s.KubernetesObjectApi.makeApiClient(this.kc);

    // Initialize rules with dummy test rules
    testRules.forEach(rule => this.rules.set(rule.id, rule));
  }

  getRules(): Promise<SlaRule[]> {
    return new Promise((resolve,reject)=> {
      resolve(Array.from(this.rules.values()))
    })
    
  }

  getRule(id: string): Promise<SlaRule> {
    return new Promise((resolve,reject) => {
      resolve(this.rules.get(id))
    })
  }

  addRule(rule: SlaRule): Promise<boolean> {
    rule.id = uuidv4();
    this.rules.set(rule.id, rule);
    return this.applyToPrometheusRuleCRD();
  }

  updateRule(rule: SlaRule): Promise<boolean> {
    if (!(rule?.id)) throw new HttpException("No Rule or Rule without Id", HttpStatus.PRECONDITION_FAILED);

    this.rules.set(rule.id, rule);
    return this.applyToPrometheusRuleCRD();  // TODO: Maybe not Re-apply all when one changes
  }

  // TODO: implement delete rule
  deleteRule(rule: SlaRule): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  rulesToPrometheusRuleCRD() {
    const obj = JSON.parse(JSON.stringify(emptyPrometheusRuleCrd));
    this.rules.forEach(rule => obj.spec.groups[0].rules.push(this.ruleToPrometheusRule(rule)));
    return obj;
  }

  async applyToPrometheusRuleCRD(): Promise<boolean> {
    const obj = this.rulesToPrometheusRuleCRD();
    this.logger.debug(`Applying CRL with ${obj.spec.groups[0].rules.length} Rules`)
    try {
      await this.k8Client.delete(obj);
    } catch (e) {
      this.logger.error("Error Deleting Sla Rules");
    }

    try {
      await this.k8Client.create(obj);
      this.logger.debug("Apply Successful");
    } catch (e) {
      this.logger.error("Error Creating Sla Rules", e.body);
      return false;
    }

    return true;
  }

  protected ruleToPrometheusRule(rule: SlaRule) {
    return               {
      alert: rule.name,
      annotations: {
        description: rule.description,
        slaRuleId: rule.id
      },
      expr: this.ruleToExpression(rule),
      for: rule.duration,
      labels: {
        severity: "critical",
      }
    }
  }

  private ruleToExpression(rule: SlaRule): string {
    if (rule.function) {
      return `${rule.function}(${rule.metric}[${rule.duration}]) ${rule.operator} ${rule.value}`
    } else {
        return `${rule.metric} ${rule.operator} ${rule.value}`
    }
  }
}



const emptyPrometheusRuleCrd = {
  apiVersion: "monitoring.coreos.com/v1",
  kind: "PrometheusRule",
  metadata: {
    labels: {
      app: "kube-prometheus-stack",
      chart: "kube-prometheus-stack-10.1.0",
      heritage: "Helm",
      release: "prometheus",
      sla: "true" // Indicates it is a sla rule configured my sla-manager
    },
    name: "sla-rules"
  },
  spec: {
    groups: [
      {
        name: "SlaRules",
        groupLabels: {
          sla: "true" // Indicates it is a sla rule configured my sla-manager
        },
        rules: [
          /*  Fill Rules here
              Example Rule:
              {
                alert: "instanceDown",
                annotations: {
                  description: "{{ $labels.instance }} of job {{ $labels.job }} has been down for more than 30 sec.",
                  summary: "Instance {{ $labels.instance }} down"
                  slaRuleId: [Rule_Id] // To correlate alerts to sla rules
                },
                expr: "up == 0",
                for: "30s",
                labels: {
                  severity: "warning",
                }
              }
          */
        ]
      }
    ]
  }
}
  