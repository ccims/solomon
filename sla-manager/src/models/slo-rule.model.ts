export default interface SloRule {
    id: string; // corresponds to AlarmArn in CW, can be a generated id for Prometheus
    name: string; // display name of the rule, provided by user
    description?: string; // displayed description of the rule, provided by user

    deploymentEnvironment: DeploymentEnvironment; // the environment where the component of the application that is to be monitored is deployed, e.g. AWS, or Kubernetes
    targetId: string; // id used by the monitoring tool in the deployment environment to identify the resource for which the rule should apply

    gropiusProjectId?: string; // id of the gropius project for which issues shall be created
    gropiusComponentId?: string; // id of the component modelled in a gropius project and which is linked in the created issue

    metricType?: string; // type of metric, e.g. availability, response time, duration etc.
    metricOption?: MetricOptions; // need for Prometheus? e.g. up, probe_success
    comparisonOperator?: ComparisonOperator; // mathematical operator to apply to the threshold
    statistic?: StatisticsOption; // the statistic applied to the data, e.g. average, rate, etc.
    period: number; // evaluation period in seconds, e.g. 86400
    threshold: number; // number against which to measure
}

export enum DeploymentEnvironment {
    AWS = 'aws',
    KUBERNETES = 'kubernetes',
}

// export enum MetricType {
//     AVAILABILITY = 'Availability',
//     RESPONSE_TIME = 'Response time',
//     CUSTOM = 'Custom'
// }

// in CW the allowed metrics depend on the target type and should thus be fetched dynamically, e.g. for Lambda Errors, Invocations, Duration, Throttles, ConcurrentExecutions
export enum MetricOptions {
    UP = 'up',
    PROBE_SUCCESS = 'probe_success',
    OTHER = 'other',    // TODO: Add other options
}

export enum ComparisonOperator {
    GREATER = 'GreaterThanThreshold ',
    LESS = 'LessThanThreshold ',
    GREATER_OR_EQUAL = 'GreaterThanOrEqualToThreshold ',
    LESS_OR_EQUAL = 'LessThanOrEqualToThreshold ',
}

export enum StatisticsOption {
    AVG = 'Average',
    SAMPLE_COUNT = 'SampleCount',
    SUM = 'Sum',
    MINIMUM = 'Minimum',
    MAXIMUM = 'Maximum'
}