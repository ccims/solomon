import { ComparisonOperator, DeploymentEnvironment, MetricOption, SloRule, StatisticsOption, Target } from 'solomon-models';
import { Alarm, AwsNamespace, DimensionFilter, LambdaFunction } from './cw.interface';

export class CwRuleMapper {
    /**
     * maps a CloudWatch alarm to an SLO rule object
     * @param alarm AWS CloudWatch alarm
     * @returns SLO rule object corresponding to the CloudWatch alarm
     */
    static mapAlarmToRule(alarm: Alarm): SloRule {
        var rule: SloRule = {
            id: alarm.AlarmArn,
            name: alarm.AlarmName,
            description: this.getAlarmDescription(alarm.AlarmDescription),
            deploymentEnvironment: DeploymentEnvironment.AWS,
            targetId: this.getTargetName(alarm.Dimensions),
            gropiusProjectId: this.getGropiusProjectId(alarm.AlarmDescription), 
            gropiusComponentId: this.getGropiusComponentId(alarm.AlarmDescription),
            metricOption: alarm.MetricName as MetricOption,
            comparisonOperator: alarm.ComparisonOperator as ComparisonOperator,
            statistic: alarm.Statistic as StatisticsOption,
            period: alarm.Period,
            threshold: alarm.Threshold,
            alertTopicArn: alarm.AlarmActions[0]
        }
        return rule;
    }

    /**
     * maps multiple CloudWatch alarm definitions to the correspoing representations as SLO rules
     * @param alarms list containing AWS CloudWatch alarm definitions
     * @returns list containing SLO rule objects
     */
    static mapAlarmsToRules(alarms: Alarm[]): SloRule[] {
        var rules: SloRule[] = [];
        alarms.forEach(alarm => {
            rules.push(this.mapAlarmToRule(alarm));
        })
        return rules;
    }

    // TODO EvaluationPoints and DatapointToAlarm as settings that can be configured
    /**
     * mapping an SLO rule object onto a CloudWatch alarm specification
     * @param rule an SLO rule object
     * @returns a CloudWatch alarm
     */
    static mapRuleToAlarm(rule: SloRule): Alarm {
        console.log(rule.metricOption)
        var alarm: Alarm = {
            AlarmName: rule.name,
            AlarmDescription: this.generateAlarmDescription(rule),
            MetricName: rule.metricOption,
            Namespace: this.getAwsNamespace(),
            Statistic: rule.statistic,
            Dimensions: [{'Name':'FunctionName','Value':rule.targetId}],
            Period: rule.period,
            EvaluationPeriods: 1,
            DatapointsToAlarm: 1,
            Threshold: rule.threshold,
            ComparisonOperator: rule.comparisonOperator,
            ActionsEnabled: true,
            AlarmActions: [rule.alertTopicArn]
        }
        return alarm;
    }

    /**
     * adds the Gropius project and component ID to the alarm description so that it gets persisted
     * @param rule rule object containing the Gropius project and component id
     * @returns the alarm description including the two Gropius related attributes
     */
    private static generateAlarmDescription(rule: SloRule): string {
        var description = rule.description;
        description = description.concat(' //// ');
        description = description.concat('gropiusProjectId:', rule.gropiusProjectId, ' ');
        description = description.concat('gropiusComponentId:', rule.gropiusComponentId);

        return description;
    }

    /**
     * extracts the Gropius project ID from the alarm description
     * @param alarmDescription Alarm description field of the CloudWatch alarm
     * @returns Gropius project ID of the rule
     */
    private static getGropiusProjectId(alarmDescription: string) {
        var matchRes = alarmDescription.match(/gropiusProjectId:([^\s])*/);
        if (matchRes == null) {
            return 'undefined'
        }
        return matchRes[0].replace('gropiusProjectId:','');
    }

    /**
     * extracts the Gropius component ID from the alarm description
     * @param alarmDescription Alarm description field of the CloudWatch alarm
     * @returns Gropius component ID of the rule
     */
    private static getGropiusComponentId(alarmDescription: string) {
        var matchRes = alarmDescription.match(/gropiusComponentId:([^\s])*/);
        if (matchRes == null) {
            return 'undefined'
        }
        return matchRes[0].replace('gropiusComponentId:','');
    }

    /**
     * extracts the actual description text from the alarm description
     * @param alarmDescription Alarm description field of the CloudWatch alarm
     * @returns the alarm / rule description
     */
    private static getAlarmDescription(alarmDescription: string) {
        var desc = alarmDescription.split(' ////')[0];
        return desc;
    }

    // TODO: FunctionName works only for Lambda, other types possible too...
    /**
     * get target for which a CloudWatch alarm is defined
     * @param dimensions dimensions field in the AWS alarm
     * @returns target name
     */
    private static getTargetName(dimensions: DimensionFilter[]): string{
        var targetName = 'unknown';
        dimensions.forEach(dimension => {
            if (dimension.Name.match('FunctionName')){
                targetName = dimension.Value;
            }
        });
        return targetName;
    }

    // TODO: implement getAwsNamespace()
    private static getAwsNamespace(): string {
        return 'AWS/Lambda';
    }



    /**
     * map an AWS Lambda function to the generic Target type
     * @param lambdaFunction description of AWS Lambda function service
     * @returns a generic Target representing the AWS Lambda function
     */
    static mapLambdaToTarget(lambdaFunction: LambdaFunction) {
        var target: Target = {
            targetName: lambdaFunction.FunctionName,
            targetId: lambdaFunction.FunctionArn,
            targetDescription: lambdaFunction.Description
        }
        return target;
    }

    /**
     * map multiple AWS Lambda functions to the generic Target type
     * @param lambdaFunctions list of AWS Lambda service functions
     * @returns list of targets representing the Lambda services
     */
    static mapLambdasToTargets(lambdaFunctions: LambdaFunction[]): Target[] {
        var targets: Target[] = [];
        lambdaFunctions.forEach(lambda => {
            targets.push(this.mapLambdaToTarget(lambda));
        })
        return targets;
    }
}
