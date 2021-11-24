import { ComparisonOperator, MetricOption, PresetOption, StatisticsOption } from "solomon-models";

export interface PrometheusRuleCRD {
    apiVersion: string;
    kind: string;
    metadata: {
        name: string;
        labels: any
    };
    spec: {
        groups: PrometheusRuleGroup[];
    }
}

export interface ProbesCRD {
    apiVersion: string;
    kind: string;
    metadata: {
        name: string;
        labels: any
    };
    spec: {
        prober: {
            url: string;
        },
        targets: {
            staticConfig: {
                labels: {},
                static: string[]
            }
        },
        module: string;
    }
}

interface PrometheusRuleGroup {
    name: string;
    groupLabels: any;
    rules: PrometheusRule[];
}

export interface PrometheusRule {
    alert: string;
    annotations: {
        description: string;
        ruleId: string;
        targetId: string;
        gropiusProjectId?: string;
        gropiusComponentId?: string;
        // used for remapping a prometheus rule to an slo rule because it would be more difficult to infer these based of a PromQL expression
        preset?: PresetOption;
        metricOption?: MetricOption;
        comparisonOperator?: ComparisonOperator;
        statistic?: StatisticsOption;
        period: number;
        threshold: number;
    }
    expr: string;
    for: string;
    labels: any;
}


/*
Example for an prometheus Rule CRD:
{
    apiVersion: "monitoring.coreos.com/v1",
        kind: "PrometheusRule",
            metadata: {
        labels: {
            app: "kube-prometheus-stack",
                chart: "kube-prometheus-stack-10.1.0",
                    heritage: "Helm",
                        release: "prometheus",
                            sla: "true", // Indicates it is a sla rule configured my sla-manager
      },
        name: "solomon-rules",
    },
    spec: {
        groups: [
            {
                name: "solomon-rules-group",
                groupLabels: {
                    solomonRule: "true", // Indicates it is a sla rule configured my sla-manager
                },
                rules: [
                    {
                      alert: name,
                      annotations: {
                        description:
                          "{{ $labels.instance }} of job {{ $labels.job }} has been down for more than 30 sec.",
                        summary: "Instance {{ $labels.instance }} down",
                        slaRuleId: "randomRuleId", // To correlate alerts to sla rules
                      },
                      expr: "up == 0",
                      for: "30s",
                      labels: {
                        severity: "warning",
                      },
                    },
                ],
            },
        ],
    },
} */