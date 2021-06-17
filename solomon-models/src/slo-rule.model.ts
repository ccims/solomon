import { Target } from "./target.model";

export default interface SloRule {
    id?: string; // corresponds to AlarmArn in CW, can be a generated id for Prometheus
    name: string; // display name of the rule, provided by user
    description?: string; // displayed description of the rule, provided by user

    deploymentEnvironment: DeploymentEnvironment; // the environment where the component of the application that is to be monitored is deployed, e.g. AWS, or Kubernetes
    targetId: string; // id used by the monitoring tool in the deployment environment to identify the resource for which the rule should apply
    gropiusProjectId?: string; // id of the gropius project for which issues shall be created
    gropiusComponentId?: string; // id of the component modelled in a gropius project and which is linked in the created issue

    preset?: PresetOptions;
    metric?: MetricOptions;
    operator?: OperatorOptions;
    function?: FunctionOptions;

    duration: number;  // evaluation period in seconds, e.g. 86400
    value: number; // number against which to measure
}

export enum DeploymentEnvironment {
    AWS = 'aws',
    KUBERNETES = 'kubernetes',
}

interface GropiusComponentTarget {
    gropiusComponentId: string;
    kubernetesServiceName: string;
}

export enum PresetOptions {
    AVAILABILITY = "Availability",
    RESPONSE_TIME = "Response time",
    CUSTOM = "Custom"
}

export enum MetricOptions {
    // UP = "up",
    PROBE_SUCCESS = "probe_success",
    RESPONSE_TIME = "probe_duration_seconds"
    // OTHER = "other",    // TODO: Add other options
}

// https://prometheus.io/docs/prometheus/latest/querying/operators/#comparison-binary-operators
export enum OperatorOptions {
    EQUALS = "==",
    NOT_EQUALS = "!=",
    GREATER_THEN = ">",
    SMALLER_THEN = "<",
    GREATER_OR_EQUAL_THEN = ">=",
    SMALLER_OR_EQUAL_THEN = "<=",
}

export enum FunctionOptions {
    AVG_OVER_TIME = "avg_over_time",
    RATE = "rate"
}