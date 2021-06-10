import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as iam from "@aws-cdk/aws-iam";

export class SloToolCdkStack extends cdk.Stack {
  
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vectorVpc = ec2.Vpc.fromLookup(this, 'vector-vpc', {
      isDefault: false, vpcId: 'vpc-0d15cde4ec8480548'
    });

    const sloToolCluster = new ecs.Cluster(this, 'slo-tool-cluster', {
      vpc: vectorVpc
    });

    const customSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'custom-security-group', 'sg-039ce1164dab874d2')

    const taskrole = new iam.Role(this, 'ecsTaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    taskrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AmazonECSTaskExecutionRolePolicy'
      )
    );

    taskrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'CloudWatchFullAccess'
      )
    );

    taskrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'CloudWatchLogsFullAccess'
      )
    );
    
    taskrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonSNSFullAccess'
      )
    );

    taskrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AWSLambda_ReadOnlyAccess'
      )
    );
  

    const taskDefinition = new ecs.TaskDefinition(this, 'task-definition', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
      taskRole: taskrole,
    });

    const path = require('path');
    const sloToolBackendImage = ecs.ContainerImage.fromAsset(path.normalize(path.join(__dirname, '../../sla-manager/')));

    const containerDef = taskDefinition.addContainer('slo-tool-backend-container', {
      image: sloToolBackendImage,
      containerName: 'slo-tool-backend',
      logging: ecs.LogDrivers.awsLogs({streamPrefix: 'SloTool'})
    })

    containerDef.addPortMappings({
      containerPort: 80,
    })

    const ecsFargateService = new ecs.FargateService(this, 'fargate-service', {
      cluster: sloToolCluster,
      taskDefinition: taskDefinition,
      securityGroups: [customSecurityGroup],
      assignPublicIp: true,
    });

  }
}
