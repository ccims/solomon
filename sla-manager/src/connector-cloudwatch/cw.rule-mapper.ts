import SloRule, { ComparisonOperator, DeploymentEnvironment, StatisticsOption } from 'src/models/slo-rule.model';
import { Target } from 'src/models/target.model';
import { Alarm, AwsNamespace, DimensionFilter, LambdaFunction } from './cw.interface';

export class CwRuleMapper {
    static mapAlarmToRule(alarm: Alarm): SloRule {
        var rule: SloRule = {
            id: alarm.AlarmArn,
            name: alarm.AlarmName,
            description: this.getAlarmDescription(alarm.AlarmDescription),
            deploymentEnvironment: DeploymentEnvironment.AWS,
            targetId: this.getTargetName(alarm.Dimensions),
            gropiusProjectId: this.getGropiusProjectId(alarm.AlarmDescription), 
            gropiusComponentId: this.getGropiusComponentId(alarm.AlarmDescription),
            metricType: alarm.MetricName,
            comparisonOperator: alarm.ComparisonOperator as ComparisonOperator,
            statistic: alarm.Statistic as StatisticsOption,
            period: alarm.Period,
            threshold: alarm.Threshold
        }
        return rule;
    }

    static mapAlarmsToRules(alarms: Alarm[]): SloRule[] {
        var rules: SloRule[] = [];
        alarms.forEach(alarm => {
            rules.push(this.mapAlarmToRule(alarm));
        })
        return rules;
    }

    // TODO EvaluationPoints and DatapointToAlarm as settings that can be configured
    static mapRuleToAlarm(rule: SloRule): Alarm {
        var alarm: Alarm = {
            AlarmName: rule.name,
            AlarmDescription: this.generateAlarmDescription(rule),
            MetricName: rule.metricType,
            Namespace: this.getAwsNamespace(),
            Statistic: rule.statistic,
            Dimensions: [{'Name':'FunctionName','Value':rule.targetId}],
            Period: rule.period,
            EvaluationPeriods: 1,
            DatapointsToAlarm: 1,
            Threshold: rule.threshold,
            ComparisonOperator: rule.comparisonOperator,
            ActionsEnabled: false // TODO: has to be activated!!
        }
        return alarm;
    }

    private static generateAlarmDescription(rule: SloRule): string {
        var description = rule.description;
        description = description.concat(' //// ');
        description = description.concat('gropiusProjectId:', rule.gropiusProjectId, ' ');
        description = description.concat('gropiusComponentId:', rule.gropiusComponentId);

        return description;
    }

    // TODO: FunctionName works only for Lambda, other types possible too...
    private static getTargetName(dimensions: DimensionFilter[]): string{
        var targetName = 'unknown';
        dimensions.forEach(dimension => {
            if (dimension.Name.match('FunctionName')){
                targetName = dimension.Value;
            }
        });
        return targetName;
    }

    private static getGropiusProjectId(alarmDescription: string) {
        var matchRes = alarmDescription.match(/gropiusProjectId:([^\s])*/);
        if (matchRes == null) {
            return 'undefined'
        }
        return matchRes[0].replace('gropiusProjectId:','');
    }

    private static getGropiusComponentId(alarmDescription: string) {
        var matchRes = alarmDescription.match(/gropiusComponentId:([^\s])*/);
        if (matchRes == null) {
            return 'undefined'
        }
        return matchRes[0].replace('gropiusComponentId:','');
    }

    private static getAlarmDescription(alarmDescription: string) {
        var desc = alarmDescription.split(' ////')[0];
        return desc;
    }

    // TODO: implement getAwsNamespace()
    private static getAwsNamespace(): string {
        return 'AWS/Lambda';
    }

    // maps a Lambda function from AWS to a generic target
    static mapLambdaToTarget(lambdaFunction: LambdaFunction) {
        var target: Target = {
            targetName: lambdaFunction.FunctionName,
            targetId: lambdaFunction.FunctionArn,
            targetDescription: lambdaFunction.Description
        }
        return target;
    }

    static mapLambdasToTargets(lambdaFunctions: LambdaFunction[]): Target[] {
        var targets: Target[] = [];
        lambdaFunctions.forEach(lambda => {
            targets.push(this.mapLambdaToTarget(lambda));
        })
        return targets;
    }
}
