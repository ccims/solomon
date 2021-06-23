"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsOption = exports.ComparisonOperator = exports.MetricOptions = exports.PresetOptions = exports.DeploymentEnvironment = void 0;
var DeploymentEnvironment;
(function (DeploymentEnvironment) {
    DeploymentEnvironment["AWS"] = "aws";
    DeploymentEnvironment["KUBERNETES"] = "kubernetes";
})(DeploymentEnvironment = exports.DeploymentEnvironment || (exports.DeploymentEnvironment = {}));
var PresetOptions;
(function (PresetOptions) {
    PresetOptions["AVAILABILITY"] = "Availability";
    PresetOptions["RESPONSE_TIME"] = "Response time";
    PresetOptions["CUSTOM"] = "Custom";
})(PresetOptions = exports.PresetOptions || (exports.PresetOptions = {}));
var MetricOptions;
(function (MetricOptions) {
    MetricOptions["PROBE_SUCCESS"] = "probe_success";
    MetricOptions["RESPONSE_TIME"] = "probe_duration_seconds";
})(MetricOptions = exports.MetricOptions || (exports.MetricOptions = {}));
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
//# sourceMappingURL=slo-rule_new.model.js.map