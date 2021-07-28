import { ComparisonOperator, DeploymentEnvironment, MetricOption, Slo, StatisticsOption, TargetType } from "solomon-models";

const cfsSlo1: Slo = {
    id: 'arn:aws:cloudwatch:eu-central-1:767491486699:alarm:APIGW4xx',
    name: 'APIGW4xx',
    description: '4xx Errors for the API Gateway',
    deploymentEnvironment: DeploymentEnvironment.AWS,
    targetId: 'adev-frankfurt-OwnerRestApi',
    targetType: TargetType.AWS_APIGATEWAY,
    metricOption: MetricOption.APIGATEWAY_4XX_ERROR,
    comparisonOperator: ComparisonOperator.LESS,
    statistic: StatisticsOption.SUM,
    period: 60,
    threshold: 1,
    alertTopicArn: 'arn:aws:sns:eu-central-1:767491486699:SLO-Tool-Alerting'
}

const cfsSlo2: Slo = {
    id: 'arn:aws:cloudwatch:eu-central-1:767491486699:alarm:APIGWcount',
    name: 'APIGWcount',
    description: 'Total number of API requests in a given period',
    deploymentEnvironment: DeploymentEnvironment.AWS,
    targetId: 'adev-frankfurt-OwnerRestApi',
    targetType: TargetType.AWS_APIGATEWAY,
    metricOption: MetricOption.APIGATEWAY_COUNT,
    comparisonOperator: ComparisonOperator.LESS,
    statistic: StatisticsOption.SUM,
    period: 60,
    threshold: 1,
    alertTopicArn: 'arn:aws:sns:eu-central-1:767491486699:SLO-Tool-Alerting'
}

const cfsSlo3: Slo = {
    id: 'arn:aws:cloudwatch:eu-central-1:767491486699:alarm:Lambda-Authorizer-Errors',
    name: 'Lambda-Authorizer-Errors',
    description: 'Lambda Errors for Authorizer',
    deploymentEnvironment: DeploymentEnvironment.AWS,
    targetId: 'adev-frankfurt-OwnerApiAuthorizerLambda',
    targetType: TargetType.AWS_LAMBDA,
    metricOption: MetricOption.LAMBDA_ERRORS,
    comparisonOperator: ComparisonOperator.LESS,
    statistic: StatisticsOption.SUM,
    period: 60,
    threshold: 1,
    alertTopicArn: 'arn:aws:sns:eu-central-1:767491486699:SLO-Tool-Alerting'
}

const cfsSlo4: Slo = {
    id: 'arn:aws:cloudwatch:eu-central-1:767491486699:alarm:Lambda-Authorizer-Throttles',
    name: 'Lambda-Authorizer-Throttles',
    description: 'Lambda Throttles for Authorizer',
    deploymentEnvironment: DeploymentEnvironment.AWS,
    targetId: 'adev-frankfurt-OwnerApiAuthorizerLambda',
    targetType: TargetType.AWS_LAMBDA,
    metricOption: MetricOption.LAMBDA_ERRORS,
    comparisonOperator: ComparisonOperator.LESS,
    statistic: StatisticsOption.SUM,
    period: 60,
    threshold: 1,
    alertTopicArn: 'arn:aws:sns:eu-central-1:767491486699:SLO-Tool-Alerting'
}

const cfsSlo5: Slo = {
    id: 'arn:aws:cloudwatch:eu-central-1:767491486699:alarm:RDSCPUUtil',
    name: 'RDSCPUUtil',
    description: 'CPU Utilization for RDS Cluster',
    deploymentEnvironment: DeploymentEnvironment.AWS,
    targetId: 'config-db-cluster',
    targetType: TargetType.AWS_RDS,
    metricOption: MetricOption.RDS_CPU_UTILIZATION,
    comparisonOperator: ComparisonOperator.LESS,
    statistic: StatisticsOption.SUM,
    period: 60,
    threshold: 10,
    alertTopicArn: 'arn:aws:sns:eu-central-1:767491486699:SLO-Tool-Alerting'
}