export default interface SloRule {
    id?: string;
    name: string;
    description?: string;
    deploymentEnvironment: DeploymentEnvironment;
    targetId: string;
    gropiusProjectId?: string;
    gropiusComponentId?: string;
    preset?: PresetOptions;
    metric?: MetricOptions;
    operator?: OperatorOptions;
    function?: FunctionOptions;
    duration: number;
    value: number;
}
export declare enum DeploymentEnvironment {
    AWS = "aws",
    KUBERNETES = "kubernetes"
}
export declare enum PresetOptions {
    AVAILABILITY = "Availability",
    RESPONSE_TIME = "Response time",
    CUSTOM = "Custom"
}
export declare enum MetricOptions {
    PROBE_SUCCESS = "probe_success",
    RESPONSE_TIME = "probe_duration_seconds"
}
export declare enum OperatorOptions {
    EQUALS = "==",
    NOT_EQUALS = "!=",
    GREATER_THEN = ">",
    SMALLER_THEN = "<",
    GREATER_OR_EQUAL_THEN = ">=",
    SMALLER_OR_EQUAL_THEN = "<="
}
export declare enum FunctionOptions {
    AVG_OVER_TIME = "avg_over_time",
    RATE = "rate"
}
