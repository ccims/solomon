export default interface SloRule {
    id?: string;
    name: string;
    description?: string;
    deploymentEnvironment: DeploymentEnvironment;
    targetId: string;
    gropiusProjectId?: string;
    gropiusComponentId?: string;
    preset?: PresetOption;
    metricOption?: MetricOption;
    comparisonOperator?: ComparisonOperator;
    statistic?: StatisticsOption;
    period: number;
    threshold: number;
    alertTopicArn?: string;
}
export declare enum DeploymentEnvironment {
    AWS = "aws",
    KUBERNETES = "kubernetes"
}
export declare enum PresetOption {
    AVAILABILITY = "Availability",
    RESPONSE_TIME = "Response time",
    CUSTOM = "Custom"
}
export declare enum MetricOption {
    PROBE_SUCCESS = "probe_success",
    RESPONSE_TIME = "probe_duration_seconds",
    DURATION = "Duration",
    INVOCATIONS = "Invocations",
    ERRORS = "Errors",
    THROTTLES = "Throttles",
    CONCURRENT_EXECUTIONS = "ConcurrentExecutions",
    CLIENT_SIDE_ERROR = "4XXError",
    SERVER_SIDE_ERROR = "5XXError",
    COUNT = "Count",
    LATENCY = "Latency",
    HEALTHY_HOST_COUNT = "HealthyHostCount",
    UNHEALTHY_HOST_COUNT = "UnHealthyHostCount",
    CLIENT_TLS_NEGOTIATION_ERROR_COUNT = "ClientTLSNegotiationErrorCount",
    TARGET_TLS_NEGOTIATION_ERROR_COUNT = "TargetTLSNegotiationErrorCount"
}
export declare enum ComparisonOperator {
    GREATER = "GreaterThanThreshold ",
    LESS = "LessThanThreshold ",
    GREATER_OR_EQUAL = "GreaterThanOrEqualToThreshold ",
    LESS_OR_EQUAL = "LessThanOrEqualToThreshold ",
    EQUAL = "Equal",
    NOT_EQUAL = "NotEqual"
}
export declare enum StatisticsOption {
    AVG = "Average",
    RATE = "Rate",
    SAMPLE_COUNT = "SampleCount",
    SUM = "Sum",
    MINIMUM = "Minimum",
    MAXIMUM = "Maximum"
}
