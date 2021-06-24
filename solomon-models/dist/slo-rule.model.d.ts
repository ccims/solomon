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
    LAMBDA_DURATION = "Duration",
    LAMBDA_INVOCATIONS = "Invocations",
    LAMBDA_ERRORS = "Errors",
    LAMBDA_THROTTLES = "Throttles",
    LAMBDA_CONCURRENT_EXECUTIONS = "ConcurrentExecutions",
    APIGATEWAY_4XX_ERROR = "4XXError",
    APIGATEWAY_5XX_ERROR = "5XXError",
    APIGATEWAY_COUNT = "Count",
    APIGATEWAY_LATENCY = "Latency",
    NLB_HEALTHY_HOST_COUNT = "HealthyHostCount",
    NLB_UNHEALTHY_HOST_COUNT = "UnHealthyHostCount",
    NLB_CLIENT_TLS_NEGOTIATION_ERROR_COUNT = "ClientTLSNegotiationErrorCount",
    NLB_TARGET_TLS_NEGOTIATION_ERROR_COUNT = "TargetTLSNegotiationErrorCount"
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
