// the SloRule interface replaces the old SlaRule interface

export default interface SloRule {
    id: string; // corresponds to AlarmArn in CW, can be generated id for Prometheus
    name: string; // display name of the rule, provided by user
    description?: string; // displayed description of the rule, provided by user

    monitoringTool: MonitoringTool; // the monitoring tool that collects the data, e.g. CloudWatch or Prometheus
    targetId: string; // id used by the monitoringTool to identify the resource for which the rule should apply
    gropiusProjectId?: string; // id of the gropius project for which issues shall be created

    metricType?: string; // type of metric, e.g. availability, response time, duration etc.
    metricOption?: MetricOptions; // need for Prometheus? e.g. up, probe_success
    comparisonOperator?: ComparisonOperator; // mathematical operator to apply to the threshold
    statistic?: StatisticsOption; // the statistic applied to the data, e.g. average, rate, etc.
    period: number; // evaluation period in seconds, e.g. 86400
    threshold: number; // number against which to measure
}

// TODO: allow selection of both? prom+cw?
export enum MonitoringTool {
    CLOUDWATCH = 'cw',
    PROMETHEUS = 'prom',
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