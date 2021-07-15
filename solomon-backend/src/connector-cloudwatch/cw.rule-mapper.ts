import { ComparisonOperator, DeploymentEnvironment, MetricOption, SloRule, StatisticsOption, Target } from 'solomon-models';
import { TargetType } from 'solomon-models/dist/target.model';
import { SloAlert } from 'src/models/alert.interface';
import { CwAlarm, AwsNamespace, DimensionFilter, CwLambdaFunction, CwMetricName, CwAlert, CwRdsCluster, CwApiGateway, CwElb, CwEcsCluster } from './cw.interface';

export class CwRuleMapper {
    /**
     * maps a CloudWatch alarm to an SLO rule object
     * @param alarm AWS CloudWatch alarm
     * @returns SLO rule object corresponding to the CloudWatch alarm
     */
    static mapCwAlarmToSloRule(alarm: CwAlarm): SloRule {
        var rule: SloRule = {
            id: alarm.AlarmArn,
            name: alarm.AlarmName,
            description: this.getAlarmDescription(alarm.AlarmDescription),
            deploymentEnvironment: DeploymentEnvironment.AWS,
            targetId: this.getTargetName(alarm.Dimensions),
            targetType: this.mapAwsNamespaceToTagetType(alarm.Namespace),
            gropiusProjectId: this.getGropiusProjectId(alarm.AlarmDescription), 
            gropiusComponentId: this.getGropiusComponentId(alarm.AlarmDescription),
            metricOption: alarm.MetricName as string as MetricOption,
            comparisonOperator: this.invertOperator(alarm.ComparisonOperator as ComparisonOperator),
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
    static mapAlarmsToRules(alarms: CwAlarm[]): SloRule[] {
        var rules: SloRule[] = [];
        alarms.forEach(alarm => {
            rules.push(this.mapCwAlarmToSloRule(alarm));
        })
        return rules;
    }

    // TODO EvaluationPoints and DatapointToAlarm as settings that can be configured
    /**
     * mapping an SLO rule object onto a CloudWatch alarm specification
     * @param rule an SLO rule object
     * @returns a CloudWatch alarm
     */
    static mapRuleToAlarm(rule: SloRule): CwAlarm {
        var alarm: CwAlarm = {
            AlarmName: rule.name,
            AlarmDescription: this.generateAlarmDescription(rule),
            MetricName: rule.metricOption as string as CwMetricName,
            Namespace: this.mapTargetTypeToAwsNamespace(rule.targetType),
            Statistic: rule.statistic,
            Dimensions: [{'Name':'FunctionName','Value':rule.targetId}],
            Period: rule.period,
            EvaluationPeriods: 1,
            DatapointsToAlarm: 1,
            Threshold: rule.threshold,
            ComparisonOperator: this.invertOperator(rule.comparisonOperator),
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

    private static mapTargetTypeToAwsNamespace(targetType: TargetType) {
        var string = targetType as string;
        string = string.replace('-','/');
        return string as AwsNamespace;
    }

    private static mapAwsNamespaceToTagetType(awsNamespace: AwsNamespace) {
        var string = awsNamespace as string;
        string = string.replace('/','-');
        return string as TargetType;
    }

    private static invertOperator(operator: ComparisonOperator): ComparisonOperator {
        switch (operator) {
            case ComparisonOperator.GREATER:
                return ComparisonOperator.LESS_OR_EQUAL;
            case ComparisonOperator.GREATER_OR_EQUAL:
                return ComparisonOperator.LESS;
            case ComparisonOperator.LESS:
                return ComparisonOperator.GREATER_OR_EQUAL;
            case ComparisonOperator.LESS_OR_EQUAL:
                return ComparisonOperator.GREATER;
            case ComparisonOperator.EQUAL:
                return ComparisonOperator.NOT_EQUAL;
            case ComparisonOperator.NOT_EQUAL:
                return ComparisonOperator.EQUAL;
            default:
                console.log('Undefined case for inversion of comparison operator!')
                break;
        }
    }

    static mapCwAlertToSloAlert(cwAlert: CwAlert): SloAlert {
        const sloAlert = {
            alertName: cwAlert.AlarmName + '-' 
                        + new Date(cwAlert.StateChangeTime).toLocaleTimeString('en-GB',) + '-'
                        + new Date(cwAlert.StateChangeTime).toLocaleDateString('en-GB'),
            alertDescription: cwAlert.NewStateReason,
            alertTime: Date.parse(cwAlert.StateChangeTime),
            sloId: cwAlert.AlarmArn,
            sloName: cwAlert.AlarmName,
            triggeringTargetName: cwAlert.Trigger.Dimensions[0].Value,
            gropiusProjectId: this.getGropiusProjectId(cwAlert.AlarmDescription),
            gropiusComponentId: this.getGropiusComponentId(cwAlert.AlarmDescription)
        }

        return sloAlert;
    }



    /**
     * map an AWS Lambda function to the generic Target type
     * @param lambdaFunction description of AWS Lambda function service
     * @returns a generic Target representing the AWS Lambda function
     */
    static mapLambdaToTarget(lambdaFunction: CwLambdaFunction) {
        var target: Target = {
            targetName: lambdaFunction.FunctionName,
            targetId: lambdaFunction.FunctionArn,
            targetDescription: lambdaFunction.Description,
            targetType: TargetType.AWS_LAMBDA
        }
        return target;
    }

    /**
     * map multiple AWS Lambda functions to the generic Target type
     * @param lambdaFunctions list of AWS Lambda service functions
     * @returns list of targets representing the Lambda services
     */
    static mapLambdasToTargets(lambdaFunctions: CwLambdaFunction[]): Target[] {
        var targets: Target[] = [];
        lambdaFunctions.forEach(lambda => {
            targets.push(this.mapLambdaToTarget(lambda));
        })
        return targets;
    }


    /**
     * map an AWS RDS cluster to the generic Target type
     * @param rdsCluster description of AWS RDS cluster
     * @returns a generic Target representing the AWS RDS cluster
     */
    static mapRdsToTarget(rdsCluster: CwRdsCluster) {
        var target: Target = {
            targetName: rdsCluster.DBClusterIdentifier,
            targetId: rdsCluster.DBClusterArn,
            targetDescription: rdsCluster.DatabaseName,
            targetType: TargetType.AWS_RDS
        }
        return target;
    }
    
    /**
     * map multiple AWS RDS clusters to the generic Target type
     * @param rdsClusters list of AWS RDS clusters
     * @returns list of targets representing the RDS clusters
     */
    static mapRdsToTargets(rdsClusters: CwRdsCluster[]): Target[] {
        var targets: Target[] = [];
        rdsClusters.forEach(cluster => {
            targets.push(this.mapRdsToTarget(cluster));
        })
        return targets;
    }

    /**
     * map an AWS API to the generic Target type
     * @param api description of AWS API
     * @returns a generic Target representing the AWS API
     */
     static mapApiToTarget(api: CwApiGateway) {
        var target: Target = {
            targetName: api.Name,
            targetId: api.ApiId,
            targetDescription: api.Description,
            targetType: TargetType.AWS_APIGATEWAY
        }
        return target;
    }

    /**
     * map multiple AWS APIs to the generic Target type
     * @param apiGateways list of AWS APIs 
     * @returns list of targets representing the APIs
     */
    static mapApisToTargets(apiGateways: CwApiGateway[]): Target[] {
        var targets: Target[] = [];
        apiGateways.forEach(api => {
            targets.push(this.mapApiToTarget(api));
        })
        return targets;
    }

    /**
     * map an AWS ELB to the generic Target type
     * @param elb description of AWS ELB
     * @returns a generic Target representing the AWS ELB
     */
    static mapElbToTarget(elb: CwElb) {
        var target: Target = {
            targetName: elb.LoadBalancerName,
            targetId: elb.CanonicalHostedZoneName,
            targetDescription: elb.CreatedTime,
            targetType: TargetType.AWS_ELB
        }
        return target;
    }   
    
    /**
     * map multiple AWS ELBs to the generic Target type
     * @param elbs list of AWS ELBs 
     * @returns list of targets representing the ELBs
     */
    static mapElbsToTargets(elbs: CwElb[]): Target[] {
        var targets: Target[] = [];
        elbs.forEach(elb => {
            targets.push(this.mapElbToTarget(elb));
        })
        return targets;
    }

    /**
     * map an AWS ECS cluster to the generic Target type
     * @param clusterArn description of AWS ECS cluster
     * @returns a generic Target representing the AWS ECS cluster
     */
    static mapEcsClusterToTarget(clusterArn: string) {
        var target: Target = {
            targetName: clusterArn, // cluster attributes such as name have to be fetched with extra call
            targetId: clusterArn,
            targetDescription: '',
            targetType: TargetType.AWS_ECS
        }
        return target;
    }   
    
    /**
     * map multiple AWS ECS clusters to the generic Target type
     * @param ecsClusters list of AWS ECS clusters
     * @returns list of targets representing the ECS clusters
     */
    static mapEcsClustersToTargets(ecsClusters: string[]): Target[] {
        var targets: Target[] = [];
        ecsClusters.forEach(cluster => {
            targets.push(this.mapEcsClusterToTarget(cluster));
        })
        return targets;
    }

}

