import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as InfrastructureCdk from '../lib/slo-tool-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new InfrastructureCdk.SloToolCdkStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
