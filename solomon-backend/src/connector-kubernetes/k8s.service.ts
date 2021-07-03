import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '@nestjs/common/services/logger.service';
import { SloRule, StatisticsOption } from 'solomon-models';
import { FunctionOptions } from 'src/models/sla-rule.model';

@Injectable()
export class K8sConnectorService { //implements ConnectorPluginService
  private rulesFilePath = '../rules.yaml';

  private rules: Map<string, SloRule> = new Map()

  private kc = new k8s.KubeConfig();
  private k8Client: k8s.KubernetesObjectApi;
  private k8sCustomApi: k8s.CustomObjectsApi;

  private readonly logger = new Logger(K8sConnectorService.name);

  constructor() {
    // Initialize Kubernetes Client
    this.kc.loadFromDefault();

    const k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.k8sCustomApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
    this.k8Client = k8s.KubernetesObjectApi.makeApiClient(this.kc);
  }

  getRules(): Promise<SloRule[]> {
    return new Promise((resolve, reject) => {
      resolve(Array.from(this.rules.values()))
    })

  }

  getRule(id: string): Promise<SloRule> {
    return new Promise((resolve, reject) => {
      resolve(this.rules.get(id))
    })
  }

  addRule(rule: SloRule): Promise<boolean> {
    rule.id = uuidv4();
    this.rules.set(rule.id, rule);
    this.logger.debug("added prometheus rule");
    return this.applyToPrometheusRuleCRD();
  }

  updateRule(rule: SloRule): Promise<boolean> {
    if (!(rule?.id)) throw new HttpException("No Rule or Rule without Id", HttpStatus.PRECONDITION_FAILED);

    this.rules.set(rule.id, rule);
    return this.applyToPrometheusRuleCRD();  // TODO: Maybe not Re-apply all when one changes
  }

  // TODO: implement delete rule
  deleteRule(rule: SloRule): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  rulesToPrometheusRuleCRD() {
    const obj = JSON.parse(JSON.stringify(emptyPrometheusRuleCrd));
    this.rules.forEach(rule => obj.spec.groups[0].rules.push(this.ruleToPrometheusRule(rule)));
    return obj;
  }

  private ruleToPrometheusRule(rule: SloRule) {
    return {
      alert: rule.name,
      annotations: {
        description: rule.description,
        slaRuleId: rule.id
      },
      expr: this.ruleToExpression(rule),
      for: "1m",  //TODO: replace with perid (convert to string 60s, 1m, ...)
      labels: {
        severity: "critical",
      }
    }
  }

  getPrometheusRules() {
    this.k8sCustomApi
      .getNamespacedCustomObject(
        "monitoring.coreos.com",
        "v1",
        "default",
        "prometheusrules",
        "sla-rules"
      )
      .then((res: any) => {
        res.body.spec.groups[0].rules.forEach(rule => console.log(rule.alert));
      });
  }

  private prometheusRuleToSloRule() {

  }

  async applyToPrometheusRuleCRD(): Promise<boolean> {
    const obj = this.rulesToPrometheusRuleCRD();
    this.logger.debug(`Applying CRL with ${obj.spec.groups[0].rules.length} Rules`)
    try {
      await this.k8Client.delete(obj);
    } catch (e) {
      this.logger.error("Error Deleting Rule");
    }

    try {
      await this.k8Client.create(obj);
      this.logger.debug("Apply Successful");
    } catch (e) {
      this.logger.debug(JSON.stringify(e));
      this.logger.error("Error Creating Rule", JSON.stringify(e.body));
      return false;
    }

    return true;
  }

  private ruleToExpression(rule: SloRule): string {
    return 'avg_over_time(up[1m]) < 0.8';
    // TODO
    // if (rule.statistic) {
    //   return `${statisticOperatorToPrometheusFunction(rule.statistic)}(${rule.metric}[${rule.duration}]) ${rule.operator} ${rule.value}`
    // } else {
    //   return `${rule.metric} ${rule.operator} ${rule.value}`
    // }
  }

  private expressionToRule() {

  }
}

function statisticOperatorToPrometheusFunction(statistic: StatisticsOption): FunctionOptions {
  switch (statistic) {
    case StatisticsOption.AVG:
      return FunctionOptions.AVG_OVER_TIME;
    case StatisticsOption.RATE:
      return FunctionOptions.RATE;
    default:
      throw "statistic option not supported for Kubernetes Environment";
  }
}

function prometheusFunctionToStatisticOperator(_function: FunctionOptions): StatisticsOption {
  switch (_function) {
    case FunctionOptions.AVG_OVER_TIME:
      return StatisticsOption.AVG;
    case FunctionOptions.RATE:
      return StatisticsOption.RATE;
    default:
      throw "not supported";
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



