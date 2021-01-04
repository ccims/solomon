// TODO: Share with backend

export default interface SlaRule {
    id?: string;
    name: string;
    description: string;
    preset?: PresetOptions;
    metric?: MetricOptions;
    operator?: OperatorOptions;
    function?: FunctionOptions;
    duration: string;
    value: number;
    gropiusProjectId?: string;
    gropiusTargets?: { [key: string]: string }; // cant use TS Map because not supported by Json
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
    UP = "up",
    PROBE_SUCCESS = "probe_success",
    OTHER = "other",    // TODO: Add other options
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