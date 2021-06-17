// modelled after https://docs.microsoft.com/en-us/rest/api/monitor/metricalerts/get#metricalertresource 

// none of this was tested yet

export interface MetricAlert {
    id: string; //Azure resource Id
    location: string //Resource location
    name: string; //Azure resource name
    properties: MetricAlertProperties; //Alert property bag
    type: string; //Azure ressource type
}

export interface MetricAlertProperties {
    description: string; 
    scope: string[]; //the list of resource id's that this metric alert is scoped to.
    criteria: AzureMetricAlertCriteria;
    actions: AzureMetricAlertAction;
    evaluationFrequency: string; //how often the metric alert is evaluated represented in ISO 8601 duration format.
    windowSize: string; // the period of time (in ISO 8601 duration format) that is used to monitor alert activity based on the threshold.
}

export interface AzureMetricAlertCriteria {
    criterionType: string // should be "StaticThresholdCriterion"
    dimensions: AzureMetricDimensions;
    metricName: string;
    metricNamespace: string;
    name: string;
    operator: AzureOperator;
    threshold: number;
    timeAggregation: AzureAggregationType;
}

export interface AzureMetricDimensions {
    name: string;
    operator: string; //the dimension operator. Only 'Include' and 'Exclude' are supported
    values: string[]; 
}

export interface AzureMetricAlertAction {
    actionGroupId: string // the id of the action group to use.
    webHookProperties: JSON; // This field allows specifying custom properties, which would be appended to the alert payload sent as input to the webhook. 
}

export enum AzureOperator {
    EQUALS = "Equals",
    GREATER_THAN = "GreaterThan",
    GREATER_OR_EQUAL = "GreaterThanOrEqual",
    LESS_THAN = "LessThan",
    LESS_OR_EQUAL = "LessThanOrEqual",
    NOT_EQUALS = "NotEquals"
}

export enum AzureAggregationType {
    AVG = "Average",
    CNT = "Count",
    MAX = "Maximum",
    MIN = "Minimum",
    TOT = "Total"
}
