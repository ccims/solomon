"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionOptions = exports.OperatorOptions = exports.MetricOptions = exports.PresetOptions = exports.DeploymentEnvironment = void 0;
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
var OperatorOptions;
(function (OperatorOptions) {
    OperatorOptions["EQUALS"] = "==";
    OperatorOptions["NOT_EQUALS"] = "!=";
    OperatorOptions["GREATER_THEN"] = ">";
    OperatorOptions["SMALLER_THEN"] = "<";
    OperatorOptions["GREATER_OR_EQUAL_THEN"] = ">=";
    OperatorOptions["SMALLER_OR_EQUAL_THEN"] = "<=";
})(OperatorOptions = exports.OperatorOptions || (exports.OperatorOptions = {}));
var FunctionOptions;
(function (FunctionOptions) {
    FunctionOptions["AVG_OVER_TIME"] = "avg_over_time";
    FunctionOptions["RATE"] = "rate";
})(FunctionOptions = exports.FunctionOptions || (exports.FunctionOptions = {}));
//# sourceMappingURL=slo-rule.model.js.map