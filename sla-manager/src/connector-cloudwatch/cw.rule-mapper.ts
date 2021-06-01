import SloRule, { ComparisonOperator, DeploymentEnvironment, StatisticsOption } from 'src/models/slo-rule.model';
import { Alarm, AwsNamespace, DimensionFilter } from './cw.interface';

export class CwRuleMapper {
    static mapAlarmToRule(alarm: Alarm): SloRule {
        var rule: SloRule = {
            id: alarm.AlarmArn,
            name: alarm.AlarmName,
            description: alarm.AlarmDescription,
            deploymentEnvironment: DeploymentEnvironment.AWS,
            targetId: this.getTargetName(alarm.Dimensions),
            gropiusProjectId: this.getGropiusProjectId(), 
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
            AlarmDescription: rule.description,
            MetricName: rule.metricType,
            Namespace: this.getAwsNamespace(),
            Statistic: rule.statistic,
            Dimensions: [{'Name':'FunctionName','Value':rule.targetId}],
            Period: rule.period,
            EvaluationPeriods: 1,
            DatapointsToAlarm: 1,
            Threshold: rule.threshold,
            ComparisonOperator: rule.comparisonOperator,
            ActionsEnabled: false
        }
        return alarm;
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

    // TODO: implement getGropiusProjectId()
    private static getGropiusProjectId() {
        return 'gropius-project-id-mock'
    }

    // TODO: implement getAwsNamespace()
    private static getAwsNamespace(): string {
        return 'AWS/Lambda';
    }
}
