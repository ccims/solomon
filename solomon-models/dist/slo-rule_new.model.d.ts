export default interface SloRule {
    id: string;
    name: string;
    description?: string;
    deploymentEnvironment: DeploymentEnvironment;
    targetId: string;
    gropiusProjectId?: string;
    gropiusComponentId?: string;
    preset?: PresetOptions;
    metricOption?: MetricOptions;
    comparisonOperator?: ComparisonOperator;
    statistic?: StatisticsOption;
    period: number;
    threshold: number;
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
