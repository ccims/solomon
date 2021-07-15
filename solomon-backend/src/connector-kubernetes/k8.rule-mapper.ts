import { ComparisonOperator, DeploymentEnvironment, MetricOption, PresetOption, SloRule, StatisticsOption } from "solomon-models";
import { PrometheusRule, PrometheusRuleCRD } from "./k8.interface";
import { FunctionOptions } from "./prometheus-rules-options";

export class K8RuleMapper {
    static promRuleToSloRule(promRule: PrometheusRule): SloRule {
        return {
            id: promRule.annotations.ruleId,
            name: promRule.alert,
            description: promRule.annotations.description,
            deploymentEnvironment: DeploymentEnvironment.KUBERNETES,
            targetId: promRule.annotations.targetId,
            gropiusProjectId: promRule.annotations.gropiusProjectId,
            gropiusComponentId: promRule.annotations.gropiusComponentId,

            // TODO: infer from rule expression
            preset: PresetOption.CUSTOM,
            metricOption: MetricOption.PROBE_SUCCESS,
            comparisonOperator: ComparisonOperator.EQUAL,
            statistic: StatisticsOption.AVG,
            period: this.promForToSeconds(promRule.for),
            threshold: 1,   // TODO: convert
        }
    }

    static sloRuleToPromRule(rule: SloRule): PrometheusRule {
        return {
            alert: rule.name,
            annotations: {
                ruleId: rule.id,
                description: rule.description,
                targetId: rule.targetId,
                gropiusComponentId: rule.gropiusComponentId,
                gropiusProjectId: rule.gropiusProjectId
            },
            expr: "up == 0",    // TODO: convert
            for: this.secondsToPromString(rule.period),
            labels: {
                severity: "warning",
            },
        }
    }

    private static secondsToPromString(seconds: number): string {
        return `${seconds}s`;   // ? Convert to Xm  Ys?
    }

    private static promForToSeconds(forString: string): number {
        return +forString.split("s")[0];
    }

    private ruleToPromExpression(rule: SloRule): string {
        
        if (rule.statistic) {
            return `${K8RuleMapper.statisticOperatorToPrometheusFunction(rule.statistic)}(${rule.metricOption}[${K8RuleMapper.secondsToPromString(rule.period)}]) ${rule.comparisonOperator} ${rule.threshold}`
        } else {
            return `${rule.metricOption} ${rule.comparisonOperator} ${rule.period}`
        }
    }

    static statisticOperatorToPrometheusFunction(statistic: StatisticsOption) {
        switch (statistic) {
            case StatisticsOption.AVG:
                return FunctionOptions.AVG_OVER_TIME;
            case StatisticsOption.RATE:
                return FunctionOptions.RATE;
            default:
                throw "statistic option not supported for Kubernetes Environment";
        }
    }

    static createPrometheusRuleCrd(): PrometheusRuleCRD {
        return {
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
                            // Add Rules here
                        ],
                    },
                ],
            },
        }
    }
}