import { ComparisonOperator, DeploymentEnvironment, MetricOption, SloRule, StatisticsOption } from "solomon-models";

const cfsSlo1: SloRule = {
    id: 'cfs-slo-1',
    name: 'gateway-5xx',
    description: '...',
    deploymentEnvironment: DeploymentEnvironment.AWS,
    targetId: 'arn...',
    metricOption: MetricOption.APIGATEWAY_5XX_ERROR,
    comparisonOperator: ComparisonOperator.GREATER,
    statistic: StatisticsOption.SUM,
    period: 60,
    threshold: 1,
    alertTopicArn: 'arn:aws:sns:eu-central-1:767491486699:SLO-Tool-Alerting'
}

const cfsSlo2: SloRule = {
    id: 'cfs-slo-2',
    name: 'lambda-error',
    description: '...',
    deploymentEnvironment: DeploymentEnvironment.AWS,
    targetId: 'arn...',
    metricOption: MetricOption.LAMBDA_ERRORS,
    comparisonOperator: ComparisonOperator.GREATER,
    statistic: StatisticsOption.SUM,
    period: 60,
    threshold: 1,
    alertTopicArn: 'arn:aws:sns:eu-central-1:767491486699:SLO-Tool-Alerting'
}

const cfsSlo3: SloRule = {
    id: 'cfs-slo-3',
    name: 'lambda-throttles',
    description: '...',
    deploymentEnvironment: DeploymentEnvironment.AWS,
    targetId: 'arn...',
    metricOption: MetricOption.LAMBDA_THROTTLES,
    comparisonOperator: ComparisonOperator.GREATER,
    statistic: StatisticsOption.SUM,
    period: 60,
    threshold: 1,
    alertTopicArn: 'arn:aws:sns:eu-central-1:767491486699:SLO-Tool-Alerting'
}

const cfsSlo4: SloRule = {
    id: 'cfs-slo-4',
    name: 'rds-cpu-utilization',
    description: '...',
    deploymentEnvironment: DeploymentEnvironment.AWS,
    targetId: 'arn...',
    metricOption: MetricOption.LAMBDA_THROTTLES, // TODO: change
    comparisonOperator: ComparisonOperator.GREATER,
    statistic: StatisticsOption.AVG,
    period: 60,
    threshold: 1, // TODO: change
    alertTopicArn: 'arn:aws:sns:eu-central-1:767491486699:SLO-Tool-Alerting'
}