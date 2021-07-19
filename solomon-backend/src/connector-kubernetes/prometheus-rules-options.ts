export enum MetricOptions {
    UP = "up",
    PROBE_SUCCESS = "probe_success",
    OTHER = "other",    // TODO: Add other options
}

// https://prometheus.io/docs/prometheus/latest/querying/operators/#comparison-binary-operators
export enum OperatorOptions {
    EQUALS = "==",
    NOT_EQUALS = "!=",
    GREATER_THEN = ">",
    SMALLER_THEN = "<",
    GREATER_OR_EQUAL_THEN = ">=",
    SMALLER_OR_EQUAL_THEN = "<=",
}

export enum FunctionOptions {
    AVG_OVER_TIME = "avg_over_time",
    RATE = "rate"
}