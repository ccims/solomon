import { ComparisonOperator, DeploymentEnvironment, MetricOption, SloRule, StatisticsOption, Target } from 'solomon-models';
import { TargetType } from 'solomon-models/dist/target.model';
import { SloAlert } from 'src/models/alert.interface';
import { CwAlarm, AwsNamespace, DimensionFilter, CwLambdaFunction, CwMetricName, CwAlert, CwRdsCluster, CwApiGateway, CwElb, CwEcsCluster } from './cw.interface';

export class CwMapper {
    /**
     * maps a CloudWatch alarm to an SLO  object
     * @param alarm AWS CloudWatch alarm
     * @returns SLO object corresponding to the CloudWatch alarm
     */
    static mapCwAlarmToSlo(alarm: CwAlarm): SloRule {
        var slo: SloRule = {
            id: alarm.AlarmArn,
            name: alarm.AlarmName,
            description: this.getAlarmDescription(alarm.AlarmDescription),
            deploymentEnvironment: DeploymentEnvironment.AWS,
            targetId: this.getTargetName(alarm.Dimensions, alarm.Namespace),
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
        return slo;
    }

    /**
     * maps multiple CloudWatch alarm definitions to the corresponding representations as SLOs
     * @param alarms list containing AWS CloudWatch alarm definitions
     * @returns list containing SLO objects
     */
    static mapAlarmsToSlos(alarms: CwAlarm[]): SloRule[] {
        var slos: SloRule[] = [];
        alarms.forEach(alarm => {
            slos.push(this.mapCwAlarmToSlo(alarm));
        })
        return slos;
    }

    // TODO EvaluationPoints and DatapointToAlarm as settings that can be configured
    /**
     * mapping an SLO object onto a CloudWatch alarm specification
     * @param slo an SLO object
     * @returns a CloudWatch alarm
     */
    static mapSloToCwAlarm(slo: SloRule): CwAlarm {
        var alarm: CwAlarm = {
            AlarmName: slo.name,
            AlarmDescription: this.generateAlarmDescription(slo),
            MetricName: slo.metricOption as string as CwMetricName,
            Namespace: this.mapTargetTypeToAwsNamespace(slo.targetType),
            Statistic: slo.statistic,
            Dimensions: [{'Name': this.getDimensionName(this.mapTargetTypeToAwsNamespace(slo.targetType)),'Value':slo.targetId}],
            Period: slo.period,
            EvaluationPeriods: 1,
            DatapointsToAlarm: 1,
            Threshold: slo.threshold,
            ComparisonOperator: this.invertOperator(slo.comparisonOperator),
            ActionsEnabled: true,
            AlarmActions: [slo.alertTopicArn]
        }
        return alarm;
    }

    /**
     * adds the Gropius project and component ID to the alarm description so that it gets persisted
     * @param slo SLO object containing the Gropius project and component id
     * @returns the CloudWatch alarm description including the two Gropius related attributes
     */
    private static generateAlarmDescription(slo: SloRule): string {
        var description = slo.description;
        description = description.concat(' //// ');
        description = description.concat('gropiusProjectId:', slo.gropiusProjectId, ' ');
        description = description.concat('gropiusComponentId:', slo.gropiusComponentId);

        return description;
    }

    /**
     * extracts the Gropius project ID from the alarm description
     * @param alarmDescription Alarm description field of the CloudWatch alarm
     * @returns Gropius project ID of the SLO
     */
    private static getGropiusProjectId(alarmDescription: string): string {
        if (!alarmDescription) {
            return 'undefined';
        }
        var matchRes = alarmDescription.match(/gropiusProjectId:([^\s])*/);
        if (matchRes == null) {
            return 'undefined'
        }
        return matchRes[0].replace('gropiusProjectId:','');
    }

    /**
     * extracts the Gropius component ID from the alarm description
     * @param alarmDescription Alarm description field of the CloudWatch alarm
     * @returns Gropius component ID of the SLO
     */
    private static getGropiusComponentId(alarmDescription: string): string {
        if (!alarmDescription) {
            return 'undefined';
        }
        var matchRes = alarmDescription.match(/gropiusComponentId:([^\s])*/);
        if (matchRes == null) {
            return 'undefined'
        }
        return matchRes[0].replace('gropiusComponentId:','');
    }

    /**
     * extracts the actual description text from the alarm description
     * @param alarmDescription Alarm description field of the CloudWatch alarm
     * @returns the SLO description
     */
    private static getAlarmDescription(alarmDescription: string): string {
        if (alarmDescription && alarmDescription.includes('////')){
            return alarmDescription.split(' ////')[0];
        } else {
            return 'Warning! This was not created as an SLO with SoLOMON but is an Alarm created directly in AWS. Update to add relevant attributes!';
        }
    }

    /**
     * get target for which a CloudWatch alarm is defined
     * @param dimensions dimensions field in the AWS alarm
     * @returns target name
     */
    private static getTargetName(dimensions: DimensionFilter[], namespace: AwsNamespace): string{
        var targetName = 'unknown';
        const dimensionName = this.getDimensionName(namespace);
        dimensions.forEach(dimension => {
            if (dimension.Name.match(dimensionName)){
                targetName = dimension.Value;
            }
        });
        return targetName;
    }

    /**
     * find out the dimension name from the selected namespace
     * @param namespace the AWS namespace of the alarm
     * @returns the dimension name
     */
    private static getDimensionName(namespace: AwsNamespace): string {
        switch (namespace) {
            case AwsNamespace.LAMBDA:
                return 'FunctionName'
            case AwsNamespace.APIGATEWAY:
                return 'ApiName'
            case AwsNamespace.ELB:
                return 'LoadBalancer'
            case AwsNamespace.RDS:
                return 'DBClusterIdentifier'
            case AwsNamespace.ECS:
                return 'ClusterName'
            default:
                console.log('CASE ' + namespace + ' not implemented...')
        }
    }

    /**
     * mapped back to the AWS Namespace in the format known by AWS
     * @param targetType target type description with "-"
     * @returns AWS namespace description with "/"
     */
    private static mapTargetTypeToAwsNamespace(targetType: TargetType): AwsNamespace {
        var string = targetType as string;
        string = string.replace('-','/');
        return string as AwsNamespace;
    }

    /**
     * this has to be mapped as the target type can be part of the URL (see getTargetList()) and is not allowed to contain "/"
     * @param awsNamespace AWS namespace description with "/"
     * @returns target type description with "-"
     */
    private static mapAwsNamespaceToTagetType(awsNamespace: AwsNamespace): TargetType {
        var string = awsNamespace as string;
        string = string.replace('/','-');
        return string as TargetType;
    }

    /**
     * Inversion of the comparison operator is needed as SLOs are formulated positively and Alarms negatively
     * @param operator Comparison operator that should be inverted
     * @returns Inverted operator
     */
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

    /**
     * map a CloudWatch alert to the SoLOMON specifc alert format
     * @param cwAlert Alert in the CloudWatch specific format
     * @returns Alert in the SoLOMON specific format
     */
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
            targetName: api.name,
            targetId: api.id,
            targetDescription: api.createdDate,
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

