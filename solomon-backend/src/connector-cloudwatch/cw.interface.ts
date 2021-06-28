// CwAlarm modelled after the following description (MetricAlarms): 
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#describeAlarms-property

export interface CwAlarm {
    AlarmName: string;
    AlarmArn?: string;
    AlarmDescription?: string;
    MetricName: CwMetricName; // e.g. 'Duration'
    Namespace: AwsNamespace; // e.g. 'AWS/Lambda'
    Statistic: string; // e.g. 'Average'
    Dimensions: DimensionFilter[]; //e.g. [{"Name":"FunctionName","Value":"handle-canoes"}]
    Period: number; // e.g. 86400
    EvaluationPeriods: number; // e.g. 1
    DatapointsToAlarm: number; // the number of datapoints within the evaluation period that must be breaching threshold to trigger alarm, e.g. 1
    Threshold: number; // e.g. 1000
    ComparisonOperator: string; // e.g. 'GreaterThanThreshold'
    ActionsEnabled: boolean; // TODO: setting the actions to be taken
    AlarmActions: string[]; // actions to execute when alarm is triggered, specified as ARN
}

export interface DimensionFilter {
    Name: string, // The dimension name to be matched.
    Value?: string //The value of the dimension to be matched.
}

export interface ParamsListMetrics {
    Dimensions?: DimensionFilter[]; // The dimensions to filter against. Only the dimensions that match exactly will be returned.
    MetricName?: string; // The name of the metric to filter against. Only the metrics with names that match exactly will be returned.
    Namespace?: string; // The metric namespace to filter against. Only the namespace that matches exactly will be returned.
    NextToken?: string; // The token returned by a previous call to indicate that there is more data available.
}

export interface LambdaMetricInfos {
    MetricNames: string[];
    FunctionNames: string[];
}

export enum AwsNamespace {
    LAMBDA = 'AWS/Lambda',
    LOGS = 'AWS/Logs',
    APIGATEWAY = 'AWS/ApiGateway',
    S3 = 'AWS/S3'
}

export enum CwMetricName {
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
    NLB_TARGET_TLS_NEGOTIATION_ERROR_COUNT = "TargetTLSNegotiationErrorCount"
}

export interface CwLambdaFunction {
    FunctionName: string; // the name of the function
    FunctionArn: string; //the Amazon Resource Name (ARN) assigned to the function
    Description: string; // user-provided description of the lambda function
}

export interface CwAlert {
    AlarmName: string;
    AlarmArn: string; // id of the alarm that caused alert
    AlarmDescription: string; // needed to extract gropiusProjectId and gropiusComponentId

    NewStateReason: string; // a description of why the alert was triggered, including time, threshold and number of datapoints
    StateChangeTime: string;

    Trigger: CwAlertTrigger;
}

// very similar to Alarm, except AlarmName, AlarmDescription and AlarmArn are not included
interface CwAlertTrigger {
    MetricName: CwMetricName;
    Namespace: AwsNamespace;
    Dimensions: DimensionFilter[];
    Statistic: string;
    ComparisonOperator: string;
    Threshold: number;
    Period: number; 
    EvaluationPeriods: number; 
}