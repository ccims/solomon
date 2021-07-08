export default interface SloRule {
    id?: string; // corresponds to AlarmArn in CW, can be a generated id for Prometheus
    name: string; // display name of the rule, provided by user
    description?: string; // displayed description of the rule, provided by user

    deploymentEnvironment: DeploymentEnvironment; // the environment where the component of the application that is to be monitored is deployed, e.g. AWS, or Kubernetes
    targetId: string; // id used by the monitoring tool in the deployment environment to identify the resource for which the rule should apply

    gropiusProjectId?: string; // id of the gropius project for which issues shall be created
    gropiusComponentId?: string; // id of the component modelled in a gropius project and which is linked in the created issue

    preset?: PresetOption; // currently only used for Kubernetes environment  e.g. availability, response time
    metricOption?: MetricOption; // concrete metric that is used (metric name)
    comparisonOperator?: ComparisonOperator; // mathematical operator to apply to the threshold
    statistic?: StatisticsOption; // the statistic applied to the data, e.g. average, rate, etc.

    period: number; // evaluation period in seconds, e.g. 86400
    threshold: number; // number against which to measure

    alertTopicArn?: string; // AWS specific: identifier of SNS topic to be used for alerting
}

export enum DeploymentEnvironment {
    AWS = 'aws',
    KUBERNETES = 'kubernetes',
}

export enum PresetOption {
    AVAILABILITY = "Availability",
    RESPONSE_TIME = "Response time",
    CUSTOM = "Custom"
}

// in CW the allowed metrics depend on the target type and should thus be fetched dynamically, e.g. for Lambda Errors, Invocations, Duration, Throttles, ConcurrentExecutions
export enum MetricOption {
    // Prometheus
    PROBE_SUCCESS = 'probe_success',
    RESPONSE_TIME = "probe_duration_seconds",

    // AWS Lambda (https://docs.aws.amazon.com/lambda/latest/dg/monitoring-metrics.html):
    LAMBDA_DURATION = "Duration",
    LAMBDA_INVOCATIONS = "Invocations",
    LAMBDA_ERRORS = "Errors",
    LAMBDA_THROTTLES = "Throttles",
    LAMBDA_CONCURRENT_EXECUTIONS = "ConcurrentExecutions",

    // AWS API Gateway (https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html):
    APIGATEWAY_4XX_ERROR = "4XXError",
    APIGATEWAY_5XX_ERROR = "5XXError",
    APIGATEWAY_COUNT = "Count",
    APIGATEWAY_LATENCY = "Latency",

    // AWS Network Load Balancer (https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-cloudwatch-metrics.html):
    NLB_HEALTHY_HOST_COUNT = "HealthyHostCount",
    NLB_UNHEALTHY_HOST_COUNT = "UnHealthyHostCount",
    NLB_CLIENT_TLS_NEGOTIATION_ERROR_COUNT = "ClientTLSNegotiationErrorCount",
    NLB_TARGET_TLS_NEGOTIATION_ERROR_COUNT = "TargetTLSNegotiationErrorCount",

    // AWS Relational Database Service (https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/monitoring-cloudwatch.html)
    RDS_CPU_UTILIZATION = "CPUUtilization",
    RDS_DATABASE_CONNECTIONS = "DatabaseConnections",
    RDS_FREE_STORAGE_SPACE = "FreeStorageSpace",
    RDS_READ_LATENCY = "ReadLatency",
    RDS_WRITE_LATENCY = "WriteLatency",
}

export enum ComparisonOperator {
    GREATER = 'GreaterThanThreshold ',
    LESS = 'LessThanThreshold ',
    GREATER_OR_EQUAL = 'GreaterThanOrEqualToThreshold ',
    LESS_OR_EQUAL = 'LessThanOrEqualToThreshold ',
    EQUAL = "Equal",
    NOT_EQUAL = "NotEqual",
}

export enum StatisticsOption {
    AVG = 'Average',
    RATE = "Rate",
    SAMPLE_COUNT = 'SampleCount',
    SUM = 'Sum',
    MINIMUM = 'Minimum',
    MAXIMUM = 'Maximum'
}