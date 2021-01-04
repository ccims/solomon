import { Test, TestingModule } from '@nestjs/testing';
import SlaRule from './models/sla-rule.model';
import { SlaRulesService } from './sla-rules.service';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

describe('SlaRulesService', () => {
  let service: SlaRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlaRulesService],
    }).compile();

    service = module.get<SlaRulesService>(SlaRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('should return an array of SlaRules', () => {
  //   expect(service.getRules()).toBeInstanceOf<SlaRule[]>(service.getRules())
  // })

  it('should match the verify rules', () => {
    expect(JSON.stringify(service.rulesToPrometheusRuleCRD())).toEqual(verifyRules);
  })

  it('should successfully apply rules', async () => {
    expect(await service.applyToPrometheusRuleCRD()).toEqual(true);
  })
});


// String to compare rules to
const verifyRules = '{"apiVersion":"monitoring.coreos.com/v1","kind":"PrometheusRule","metadata":{"labels":{"app":"kube-prometheus-stack","chart":"kube-prometheus-stack-10.1.0","heritage":"Helm","release":"prometheus"},"name":"sla-rules"},"spec":{"groups":[{"name":"SlaRules","rules":[{"alert":"BadAvailability","annotations":{"description":"{{ $labels.instance }} of job {{ $labels.job }} has a availability less then 0.8 over the last minute","summary":"Instance {{ $labels.instance }} has bad availability"},"expr":"avg_over_time(up[1m]) < 0.8","for":"1m","labels":{"severity":"critical"}}]}]}}'

/* Equivalent Object to following yaml file

apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  labels:
    app: kube-prometheus-stack
    chart: kube-prometheus-stack-10.1.0
    heritage: Helm
    release: prometheus
  name: sla-rules
spec:
  groups:
    - name: SlaRules
      rules:
        - alert: BadAvailability
          annotations:
            description: >-
              {{ $labels.instance }} of job {{ $labels.job }} has a availability
              less then 0.8 over the last minute
            summary: 'Instance {{ $labels.instance }} has bad availability'
          expr: 'avg_over_time(up[1m]) < 0.8'
          for: 1m
          labels:
            severity: critical
*/
