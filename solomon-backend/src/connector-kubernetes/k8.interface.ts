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