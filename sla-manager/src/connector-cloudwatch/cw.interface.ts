// Alarm modelled after the following description (MetricAlarms): 
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#describeAlarms-property

export interface Alarm {
    AlarmName: string;
    AlarmArn?: string;
    AlarmDescription?: string;
    MetricName: string; // e.g. 'Duration'
    Namespace: string; // e.g. 'AWS/Lambda'
    Statistic: string; // e.g. 'Average'
    Dimensions: DimensionFilter[]; //e.g. [{"Name":"FunctionName","Value":"handle-canoes"}]
    Period: number; // e.g. 86400
    EvaluationPeriods: number; // e.g. 1
    DatapointsToAlarm: number; // the number of datapoints within the evaluation period that must be breaching threshold to cause the alarm to go to ALARM state. e.g. 1
    Threshold: number; // e.g. 1000
    ComparisonOperator: string; // e.g. 'GreaterThanThreshold'
    ActionsEnabled: boolean; // TODO: setting the actions to be taken
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

export interface LambdaFunction {
    FunctionName: string; // the name of the function
    FunctionArn: string; //the Amazon Resource Name (ARN) assigned to the function
    Description: string; // user-provided description of the lambda function
}