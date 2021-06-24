"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsOption = exports.ComparisonOperator = exports.MetricOption = exports.PresetOption = exports.DeploymentEnvironment = void 0;
var DeploymentEnvironment;
(function (DeploymentEnvironment) {
    DeploymentEnvironment["AWS"] = "aws";
    DeploymentEnvironment["KUBERNETES"] = "kubernetes";
})(DeploymentEnvironment = exports.DeploymentEnvironment || (exports.DeploymentEnvironment = {}));
var PresetOption;
(function (PresetOption) {
    PresetOption["AVAILABILITY"] = "Availability";
    PresetOption["RESPONSE_TIME"] = "Response time";
    PresetOption["CUSTOM"] = "Custom";
})(PresetOption = exports.PresetOption || (exports.PresetOption = {}));
var MetricOption;
(function (MetricOption) {
    MetricOption["PROBE_SUCCESS"] = "probe_success";
    MetricOption["RESPONSE_TIME"] = "probe_duration_seconds";
    MetricOption["LAMBDA_DURATION"] = "Duration";
    MetricOption["LAMBDA_INVOCATIONS"] = "Invocations";
    MetricOption["LAMBDA_ERRORS"] = "Errors";
    MetricOption["LAMBDA_THROTTLES"] = "Throttles";
    MetricOption["LAMBDA_CONCURRENT_EXECUTIONS"] = "ConcurrentExecutions";
    MetricOption["APIGATEWAY_4XX_ERROR"] = "4XXError";
    MetricOption["APIGATEWAY_5XX_ERROR"] = "5XXError";
    MetricOption["APIGATEWAY_COUNT"] = "Count";
    MetricOption["APIGATEWAY_LATENCY"] = "Latency";
    MetricOption["NLB_HEALTHY_HOST_COUNT"] = "HealthyHostCount";
    MetricOption["NLB_UNHEALTHY_HOST_COUNT"] = "UnHealthyHostCount";
    MetricOption["NLB_CLIENT_TLS_NEGOTIATION_ERROR_COUNT"] = "ClientTLSNegotiationErrorCount";
    MetricOption["NLB_TARGET_TLS_NEGOTIATION_ERROR_COUNT"] = "TargetTLSNegotiationErrorCount";
})(MetricOption = exports.MetricOption || (exports.MetricOption = {}));
var ComparisonOperator;
(function (ComparisonOperator) {
    ComparisonOperator["GREATER"] = "GreaterThanThreshold ";
    ComparisonOperator["LESS"] = "LessThanThreshold ";
    ComparisonOperator["GREATER_OR_EQUAL"] = "GreaterThanOrEqualToThreshold ";
    ComparisonOperator["LESS_OR_EQUAL"] = "LessThanOrEqualToThreshold ";
    ComparisonOperator["EQUAL"] = "Equal";
    ComparisonOperator["NOT_EQUAL"] = "NotEqual";
})(ComparisonOperator = exports.ComparisonOperator || (exports.ComparisonOperator = {}));
var StatisticsOption;
(function (StatisticsOption) {
    StatisticsOption["AVG"] = "Average";
    StatisticsOption["RATE"] = "Rate";
    StatisticsOption["SAMPLE_COUNT"] = "SampleCount";
    StatisticsOption["SUM"] = "Sum";
    StatisticsOption["MINIMUM"] = "Minimum";
    StatisticsOption["MAXIMUM"] = "Maximum";
})(StatisticsOption = exports.StatisticsOption || (exports.StatisticsOption = {}));
//# sourceMappingURL=slo-rule.model.js.map