#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SloToolCdkStack } from '../lib/slo-tool-stack';

const app = new cdk.App();

let account = process.env.CDK_DEPLOY_ACCOUNT;
if(account === undefined){
  throw Error("Need environment variable CDK_DEPLOY_ACCOUNT defined.");
}

new SloToolCdkStack(app, 'SloToolCdkStack', {
  env: { account: account, region: 'eu-central-1' },
  description: 'Stack for the SLO Tool developed by Raoul'
});
