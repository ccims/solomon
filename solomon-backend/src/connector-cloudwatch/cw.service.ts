import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { SloRule, Target } from 'solomon-models';
import { TargetType } from 'solomon-models/dist/target.model';
import { ConnectorService } from 'src/models/connector-service';
import { CwRuleMapper } from './cw.rule-mapper';


@Injectable()
export class CwConnectorService implements ConnectorService{
    private readonly logger = new Logger(CwConnectorService.name);
    private readonly configService = new ConfigService();

    private REGION = this.configService.get('REGION');
    private PROXY = this.configService.get('PROXY');
    
    private AWS = require('aws-sdk');
    private cw;
    private lambda;
    private sns;
    private apiGateway;
    private ecs;
    private elb;
    private rds;

    private connected = false;

    connectToAws(): string {

      // proxy required only for local development in Vector environment
      if (process.env.https_proxy === this.PROXY) {
        const proxy = require('proxy-agent');
        this.AWS.config.update({ httpOptions: { agent: proxy(this.PROXY)}})
        this.AWS.config.update({region: this.REGION});
      }
  
      // instanciate the service interface objects
      this.cw = new this.AWS.CloudWatch();
      this.lambda = new this.AWS.Lambda();
      this.sns = new this.AWS.SNS();
      this.apiGateway = new this.AWS.APIGateway();
      this.ecs = new this.AWS.ECS();
      this.elb = new this.AWS.ELB();
      this.rds = new this.AWS.RDS();
  
      this.connected = true;
      return ('successfully connected to AWS...')
    }
    
    getRules(): Promise<SloRule[]> {
      this.connected ? /*already connected */null : this.connectToAws();

      const params = {};

      return new Promise((resolve, reject) =>{
        this.cw.describeAlarms(params, (err, data) => {
          if (err) {
            reject(new Error(err));
          } else {
            this.logger.debug(data)
            var sloRules = CwRuleMapper.mapAlarmsToRules(data.MetricAlarms)
            resolve(sloRules)
          }
        })
      })
    }

    async getRule(ruleId: string): Promise<SloRule> {
      this.connected ? /*already connected */null : this.connectToAws();

      const rules = await this.getRules();

      return new Promise((resolve,reject) => {
        try {
          const rule = rules.find(rule => rule.id === ruleId);
          return resolve(rule);
        } catch (err) {
          reject(new Error(err));
        }
      })
    }
    
    addRule(rule: SloRule): Promise<boolean> {
      this.connected ? /*already connected */null : this.connectToAws();
      var alarm = CwRuleMapper.mapRuleToAlarm(rule);

      return new Promise((resolve,reject) => {
          this.cw.putMetricAlarm(alarm, (err, data) => {
              if (err) {
                  reject(new Error(err));
              } else {
                  this.logger.log(data)
                  resolve(true);
              }
          })
      })
    }

    updateRule(rule: SloRule): Promise<boolean> {
      this.connected ? /*already connected */null : this.connectToAws();
      var alarm = CwRuleMapper.mapRuleToAlarm(rule);

      return new Promise((resolve,reject) => {
          this.cw.putMetricAlarm(alarm, (err, data) => {
              if (err) {
                  reject(new Error(err));
              } else {
                  this.logger.log(data)
                  resolve(true);
              }
          })
      })
    }

    async deleteRule(ruleId: string): Promise<boolean> {
      this.connected ? /*already connected */null : this.connectToAws();

      const rule = await this.getRule(ruleId);
      
      const params = { AlarmNames: [rule.name]};

      return new Promise((resolve,reject) => {
        this.cw.deleteAlarms(params, (err, data) => {
            if (err) {
                reject(new Error(err));
            } else {
                this.logger.log(data)
                resolve(true);
            }
        })
      })
    }

   // currently return the ARN of the SNS topic to which CloudWatch should send alerts
    // other actions might be possible too (see AlarmActions: https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html )
    getAlarmActions(): Promise<string[]> {
      this.connected ? /*already connected */null : this.connectToAws();
      
      const params = {};

      return new Promise((resolve, reject) =>{
        this.sns.listTopics(params, (err, data) => {
          if (err) {
            reject(new Error(err));
          } else {
            var topicArns = [];
            data.Topics.forEach(topic => {
              topicArns.push(topic.TopicArn)
            });
            resolve(topicArns)
          }
        })
      })
    }

    // env variable not used, only there because of inheritance..
    async getTargets(env, targetType?: TargetType): Promise<Target[]> {
      this.connected ? /*already connected */null : this.connectToAws();

      var targets = [];

      // if no specific target type is passed, send all targets
      if (targetType === undefined) {
        targets.push(... await this.getLambdas());
        targets.push(... await this.getApiGateways());
        targets.push(... await this.getElbs());
        targets.push(... await this.getRdsClusters());
        targets.push(... await this.getEcsClusters());
        return targets;
      }

      // if targets for specific type are requested
      switch (targetType) {
        case TargetType.AWS_LAMBDA:
          targets.push(... await this.getLambdas());
          break;
        case TargetType.AWS_APIGATEWAY:
          targets.push(... await this.getApiGateways());
          break;
        case TargetType.AWS_ELB:
          targets.push(... await this.getElbs());
          break;
        case TargetType.AWS_RDS:
          targets.push(... await this.getRdsClusters());
          break;
        case TargetType.AWS_ECS:
          targets.push(... await this.getEcsClusters());
          break;
      }
      
      return targets;
    }

 
    private getLambdas(): Promise<Target[]> {
      const params = {};
      return new Promise((resolve, reject) =>{
        this.lambda.listFunctions(params, (err, data) => {
          if (err) {
            reject(new Error(err));
          } else {
            resolve(CwRuleMapper.mapLambdasToTargets(data.Functions))
          }
        })
      })     
    }

    private getRdsClusters(): Promise<Target[]> {    
      const params = {};
      return new Promise((resolve, reject) =>{
        this.rds.describeDBClusters(params, (err, data) => {
          if (err) {
            reject(new Error(err));
          } else {
            resolve(CwRuleMapper.mapRdsToTargets(data.DBClusters));
          }
        })
      }) 
    }

    private getApiGateways(): Promise<Target[]> {    
      const params = {};
      return new Promise((resolve, reject) =>{
        this.apiGateway.getRestApis(params, (err, data) => {
          if (err) {
            reject(new Error(err));
          } else {
            resolve(CwRuleMapper.mapApisToTargets(data.items));
          }
        })
      }) 
    }

    // TODO: function does currently not seem to return the existing Load Balancers
    private getElbs(): Promise<Target[]> {    
      const params = {};
      return new Promise((resolve, reject) =>{
        this.elb.describeLoadBalancers(params, (err, data) => {
          if (err) {
            reject(new Error(err));
          } else {
            resolve(CwRuleMapper.mapElbsToTargets(data.LoadBalancerDescriptions));
          }
        })
      }) 
    }

    // TODO: maybe need to fetch sevices of cluster specifically?
    private getEcsClusters(): Promise<Target[]> {    
      const params = {};
      return new Promise((resolve, reject) =>{
        this.ecs.listClusters(params, (err, data) => {
          if (err) {
            reject(new Error(err));
          } else {
            resolve(CwRuleMapper.mapEcsClustersToTargets(data.clusterArns));
          }
        })
      }) 
    }

}
