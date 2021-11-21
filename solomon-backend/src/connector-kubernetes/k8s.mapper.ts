import { ComparisonOperator, DeploymentEnvironment, MetricOption, PresetOption, Slo, StatisticsOption } from "solomon-models";
import { ProbesCRD, PrometheusRule, PrometheusRuleCRD } from "./k8s.interface";
import { FunctionOptions, OperatorOptions } from "./prometheus-rules-options";
import * as k8s from '@kubernetes/client-node';
import { K8sDeployment } from "./k8s-environment.interface";

export default class K8sMapper {
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
            expr: K8sMapper.ruleToPromExpression(rule),
            for: K8sMapper.secondsToPromString(rule.period),
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
            return `${K8sMapper.statisticOperatorToPrometheusFunction(rule.statistic)}(${rule.metricOption}[${K8sMapper.secondsToPromString(rule.period)}]) ${K8sMapper.comparisonOperatorToPrometheusFunction(rule.comparisonOperator)} ${rule.threshold}`
        } else {
            return `${rule.metricOption} ${K8sMapper.comparisonOperatorToPrometheusFunction(rule.comparisonOperator)} ${rule.threshold}`
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
        // Invert Comparison operator because SLOs are formulated positively and Prometheus Rules negatively
        switch (comparison) {
            case ComparisonOperator.EQUAL:
                return OperatorOptions.NOT_EQUALS;
            case ComparisonOperator.NOT_EQUAL:
                return OperatorOptions.EQUALS;
            case ComparisonOperator.GREATER:
                return OperatorOptions.SMALLER_OR_EQUAL_THEN;
            case ComparisonOperator.GREATER_OR_EQUAL:
                return OperatorOptions.SMALLER_THEN;
            case ComparisonOperator.LESS:
                return OperatorOptions.GREATER_OR_EQUAL_THEN;
            case ComparisonOperator.LESS_OR_EQUAL:
                return OperatorOptions.GREATER_THEN;
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

    static createProbersCrd(): ProbesCRD {
        return {
            apiVersion: "monitoring.coreos.com/v1",
            kind: "Probe",
            metadata: {
                labels: {
                    app: "kube-prometheus-stack",
                    chart: "kube-prometheus-stack-10.1.0",
                    heritage: "Helm",
                    release: "prometheus",
                },
                name: "solomon-probes",
            },
            spec: {
                prober: {
                    url: "blackbox-exporter-prometheus-blackbox-exporter.default.svc.cluster.local:9115"
                },
                targets: {
                    staticConfig: {
                        static: [],
                        labels: {
                            environment: "prometheus.io"
                        }
                    },
                },
                module: "http_2xx",
            },
        }
    }

    static createDeploymentResourceFromK8sDeployment(deployment: K8sDeployment, namespace: string) {
        return {
            apiVersion: "apps/v1",
            kind: "Deployment",
            metadata: {
                name: `${deployment.name}-deployment`,
                namespace: namespace ?? "default",
                labels: {
                    app: `${deployment.name}-app`,
                    "solomon-deployed": "true",
                    "solomon-original-replicas": `${deployment.replicas}`,
                    // "solomon-deployed-image": `${deployment.image}`, // Invalid string for deplyment because / or : in image
                    "solomon-deployed-port": `${deployment.port}`,
                },
            },
            spec: {
                selector: {
                    matchLabels: {
                        app: `${deployment.name}-app`,
                    },
                },
                replicas: 2,
                strategy: {
                    type: "RollingUpdate",
                    rollingUpdate: {
                        maxSurge: 1,
                        maxUnavailable: 0,
                    },
                },
                template: {
                    metadata: {
                        labels: {
                            app: `${deployment.name}-app`,
                        },
                    },
                    spec: {
                        containers: [
                            {
                                name: `${deployment.name}-app`,
                                image: deployment.image,
                                imagePullPolicy: "Always",
                                ports: [
                                    {
                                        containerPort: deployment.port,
                                    },
                                ],
                                resources: {
                                    requests: {
                                        memory: "64Mi",
                                        cpu: "10m",
                                    },
                                    limits: {
                                        memory: "256Mi",
                                        cpu: "500m",
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        };
    }
    
    static createServiceResourceFromK8sDeployment(deployment: K8sDeployment, namespace: string) {
        return {
            apiVersion: "v1",
            kind: "Service",
            metadata: {
                name: `${deployment.name}-service`,
                namespace: namespace ?? "default",
                labels: {
                    app: `${deployment.name}-app`,
                    "solomon-deployed": "true",
                    "solomonTarget": "true",
                    "monitoring": "true",
                },
            },
            spec: {
                selector: {
                    app: `${deployment.name}-app`,
                },
                type: "LoadBalancer",
                ports: [
                    {
                        name: "http",
                        port: 80,
                        protocol: "TCP",
                        targetPort: deployment.port
                    }
                ],
            },
        };
    }

    static mapK8sDeployment(deployment: k8s.V1Deployment): K8sDeployment {
        return {
            name: deployment.metadata.name,
            replicas: deployment.spec.replicas,
            image: deployment.metadata.labels.solomonDeployedImage,
            port: deployment.metadata.labels.solomonDeployedPort as any,

        }
    }
}

