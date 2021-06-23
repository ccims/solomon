import { Injectable, Logger } from '@nestjs/common';
import { ConnectorService } from 'src/models/connector-service';
import SloRule from 'src/models/slo-rule.model';
import { Target } from 'src/models/target.model';
import { LambdaMetricInfos } from './cw.interface';
import { CwRuleMapper } from './cw.rule-mapper';

const REGION = 'eu-central-1';
const PROXY = 'http://apt-get:apt-get@www-proxy.vi.vector.int:8080/';

@Injectable()
export class CwConnectorService implements ConnectorService{
    private readonly logger = new Logger(CwConnectorService.name);

    
    private AWS = require('aws-sdk');
    private cw;
    private lambda;
    private sns;
    private connected = false;
    private lambdaMetricInfos: LambdaMetricInfos;

    connectToAws(): string {
        // proxy required only for local development in Vector environment
        if (process.env.https_proxy === 'http://apt-get:apt-get@www-proxy.vi.vector.int:8080/') {
          const proxy = require('proxy-agent');
          this.AWS.config.update({ httpOptions: { agent: proxy(PROXY)}})
          this.AWS.config.update({region: REGION});
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

    deleteRule(name: string): Promise<boolean> {
        this.connected ? /*already connected */null : this.connectToAws();

        const params = { AlarmNames: [name]};

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

}