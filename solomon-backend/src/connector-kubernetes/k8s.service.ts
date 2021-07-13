import * as k8s from '@kubernetes/client-node';
import { Injectable, Logger } from "@nestjs/common";
import { SloRule, Target } from "solomon-models";
import { ConnectorService } from "src/models/connector-service";
import { PrometheusRuleCRD } from "./k8.interface";
import { K8RuleMapper } from "./k8.rule-mapper";
import { v4 as uuidv4 } from 'uuid';

const PROM_CRD_RULES_NAME = "solomon-rules";
@Injectable()
export class K8sConnectorService implements ConnectorService {

    private readonly logger = new Logger(K8sConnectorService.name);
    private k8ClientApi: k8s.KubernetesObjectApi;
    private k8CustomApi: k8s.CustomObjectsApi;
    private k8CoreApi: k8s.CoreV1Api;

    constructor() {
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        this.k8ClientApi = k8s.KubernetesObjectApi.makeApiClient(kc);
        this.k8CustomApi = kc.makeApiClient(k8s.CustomObjectsApi);
        this.k8CoreApi = kc.makeApiClient(k8s.CoreV1Api);
    }

    async getRules(): Promise<SloRule[]> {
        const res = await this.getRuleResource();
        return res.spec.groups[0].rules.map(rule => K8RuleMapper.promRuleToSloRule(rule));
    }

    private async getRuleResource(): Promise<PrometheusRuleCRD> {
        const res = await this.k8CustomApi.getNamespacedCustomObject(
            "monitoring.coreos.com",
            "v1",
            "default",
            "prometheusrules",
            PROM_CRD_RULES_NAME
        );
        return res.body as PrometheusRuleCRD;
    }

    async getRule(ruleId: string): Promise<SloRule> {
        const res = await this.getRuleResource();
        return res.spec.groups[0].rules.map(rule => K8RuleMapper.promRuleToSloRule(rule)).find(rule => rule.id === ruleId);
    }

    async addRule(rule: SloRule): Promise<boolean> {
        rule.id = uuidv4();
        try {
            const res = await this.getRuleResource();
            if (res) {
                return this.addRuleAndApply(rule, res, true);
            }
        } catch (error) {
            if (error.body.code === 404) {
                return this.addRuleAndApply(rule, K8RuleMapper.createPrometheusRuleCrd(), false);
            }
        }
        // TODO: configer Blackbox exporter to probe url
    }

    private async addRuleAndApply(sloRule: SloRule, promRuleCrd: PrometheusRuleCRD, isReplacing: boolean): Promise<boolean> {
        promRuleCrd.spec.groups[0].rules.push(K8RuleMapper.sloRuleToPromRule(sloRule));

        try {
            if (isReplacing) {
                await this.k8ClientApi.replace(promRuleCrd);
            } else {
                await this.k8ClientApi.create(promRuleCrd);
            }
            this.logger.debug("Applied Prometheus Rule CRD successfully")
            return true;
        } catch (e) {
            this.logger.error("Error applying Prometheus Rule CRD", JSON.stringify(e));
            return false;
        }
    }


    async updateRule(rule: SloRule): Promise<boolean> {
        const res = await this.getRuleResource();
        const index = res.spec.groups[0].rules.findIndex(e => e.annotations.ruleId === rule.id);
        res.spec.groups[0].rules[index] = K8RuleMapper.sloRuleToPromRule(rule);
        try {
            await this.k8ClientApi.replace(res);
            this.logger.debug("Updated Prometheus Rule CRD successfully")
            return true;
        } catch (e) {
            this.logger.error("Error updating Prometheus Rule CRD", JSON.stringify(e));
            return false;
        }
    }

    async deleteRule(ruleId: string): Promise<boolean> {
        const res = await this.getRuleResource();
        const index = res.spec.groups[0].rules.findIndex(e => e.annotations.ruleId === ruleId);
        res.spec.groups[0].rules.splice(index, 1);
        try {
            await this.k8ClientApi.replace(res);
            this.logger.debug("Delete Prometheus Rule CRD successfully")
            return true;
        } catch (e) {
            this.logger.error("Error deleting Prometheus Rule CRD", JSON.stringify(e));
            return false;
        }
    }

    async getTargets(): Promise<Target[]> {
        try {
            const res = await this.k8CoreApi.listNamespacedService("default")
            const list: Target[] = res.body.items.filter(service => service.metadata.labels.solomonTarget === "true").map((service) => {
                return {
                    targetName: service.metadata.name,
                    targetId: service.metadata.uid,
                };
            });
            return list;
        } catch (e) {
            console.log(e);
        }
    }
}