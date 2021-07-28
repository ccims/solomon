import { ComparisonOperator, DeploymentEnvironment, MetricOption, PresetOption, Slo, StatisticsOption } from "solomon-models";
import { PrometheusRule, PrometheusRuleCRD } from "./k8.interface";
import { FunctionOptions, OperatorOptions } from "./prometheus-rules-options";

export class K8RuleMapper {
    static promRuleToSloRule(promRule: PrometheusRule): Slo {
        return {
            id: promRule.annotations.ruleId,
            name: promRule.alert,
            description: promRule.annotations.description,
            deploymentEnvironment: DeploymentEnvironment.KUBERNETES,
            targetId: promRule.annotations.targetId,
            gropiusProjectId: promRule.annotations.gropiusProjectId,
            gropiusComponentId: promRule.annotations.gropiusComponentId,
            preset: promRule.annotations.preset,
            metricOption: promRule.annotations.metricOption,
            comparisonOperator: promRule.annotations.comparisonOperator,
            statistic: promRule.annotations.statistic,
            period: promRule.annotations.period,
            threshold: promRule.annotations.threshold,
        }
    }

    static sloRuleToPromRule(rule: Slo): PrometheusRule {
        return {
            alert: rule.name,
            annotations: {
                ruleId: rule.id,
                description: rule.description,
                targetId: rule.targetId,
                gropiusComponentId: rule.gropiusComponentId,
                gropiusProjectId: rule.gropiusProjectId,
                comparisonOperator: rule.comparisonOperator,
                metricOption: rule.metricOption,
                preset: rule.preset,
                statistic: rule.statistic,
                period: rule.period,
                threshold: rule.threshold
            },
            expr: K8RuleMapper.ruleToPromExpression(rule),
            for: K8RuleMapper.secondsToPromString(rule.period),
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

    private static ruleToPromExpression(rule: Slo): string {
        if (rule.statistic) {
            return `${K8RuleMapper.statisticOperatorToPrometheusFunction(rule.statistic)}(${rule.metricOption}[${K8RuleMapper.secondsToPromString(rule.period)}]) ${K8RuleMapper.comparisonOperatorToPrometheusFunction(rule.comparisonOperator)} ${rule.threshold}`
        } else {
            return `${rule.metricOption} ${K8RuleMapper.comparisonOperatorToPrometheusFunction(rule.comparisonOperator)} ${rule.threshold}`
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

    static comparisonOperatorToPrometheusFunction(comparison: ComparisonOperator) {
        switch (comparison) {
            case ComparisonOperator.EQUAL:
                return OperatorOptions.EQUALS;
            case ComparisonOperator.NOT_EQUAL:
                return OperatorOptions.NOT_EQUALS;
            case ComparisonOperator.GREATER:
                return OperatorOptions.GREATER_THEN;
            case ComparisonOperator.GREATER_OR_EQUAL:
                return OperatorOptions.GREATER_OR_EQUAL_THEN;
            case ComparisonOperator.LESS:
                return OperatorOptions.SMALLER_THEN;
            case ComparisonOperator.LESS_OR_EQUAL:
                return OperatorOptions.SMALLER_OR_EQUAL_THEN;
            default:
                throw "comparison option not supported for Kubernetes Environment";
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