import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SloRule, Target } from 'solomon-models';
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
    private connected = false;

    connectToAws(): string {

      // proxy required only for local development in Vector environment
      if (process.env.https_proxy === this.PROXY) {
        const proxy = require('proxy-agent');
        this.AWS.config.update({ httpOptions: { agent: proxy(this.PROXY)}})
        this.AWS.config.update({region: this.REGION});
      }
  
      this.cw = new this.AWS.CloudWatch();
      this.lambda = new this.AWS.Lambda();
      this.sns = new this.AWS.SNS;
  
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

    // currently fetches only lambda functions TODO: fetch targets of other service types
    getTargets(): Promise<Target[]> {
      this.connected ? /*already connected */null : this.connectToAws();

      const params = {};

      return new Promise((resolve, reject) =>{
        this.lambda.listFunctions(params, (err, data) => {
          if (err) {
            reject(new Error(err));
          } else {
            var targets = CwRuleMapper.mapLambdasToTargets(data.Functions)
            resolve(targets)
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




}
