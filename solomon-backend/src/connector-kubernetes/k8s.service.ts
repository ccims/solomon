import * as k8s from '@kubernetes/client-node';
import { Injectable, Logger } from "@nestjs/common";
import { Slo, Target } from "solomon-models";
import { ConnectorService } from "src/models/connector-service";
import { ProbesCRD, PrometheusRuleCRD } from "./k8s.interface";
import K8sMapper from "./k8s.mapper";
import { v4 as uuidv4 } from 'uuid';

const PROM_CRD_RULES_NAME = "solomon-rules";
const PROM_CRD_PROBES_NAME = "solomon-probes";
@Injectable()
export class K8sConnectorService implements ConnectorService {

    private readonly logger = new Logger(K8sConnectorService.name);
    private k8sClientApi: k8s.KubernetesObjectApi;
    private k8sCustomApi: k8s.CustomObjectsApi;
    private k8sCoreApi: k8s.CoreV1Api;

    constructor() {
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        this.k8sClientApi = k8s.KubernetesObjectApi.makeApiClient(kc);
        this.k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);
        this.k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
    }

    /**
     * gets all applied slos in the kubernetes cluster
     * 
     * @returns all applied slos in the kubernetes cluster
     */
    async getSlos(): Promise<Slo[]> {
        try {
            const res = await this.getRuleResource();
            return res.spec.groups[0].rules.map(rule => K8sMapper.promRuleToSloRule(rule));
        } catch (error) {
            this.logger.error(error.body);
            return null;
        }
    }

    /**
     * Gets the prometheusrule CRD where all rules are configured
     * 
     * @returns a promise of PrometheusRuleCRD
     */
    private async getRuleResource(): Promise<PrometheusRuleCRD> {
        const res = await this.k8sCustomApi.getNamespacedCustomObject(
            "monitoring.coreos.com",
            "v1",
            "default",
            "prometheusrules",
            PROM_CRD_RULES_NAME
        );
        return res.body as PrometheusRuleCRD;
    }


    /**
     * gets the probes CRD where all prometheus blackbox exporter targets are configured
     * 
     * @returns a promise of ProbesCRD
     */
    private async getProbeResource(): Promise<ProbesCRD> {
        const res = await this.k8sCustomApi.getNamespacedCustomObject(
            "monitoring.coreos.com",
            "v1",
            "default",
            "probes",
            PROM_CRD_PROBES_NAME
        );
        return res.body as ProbesCRD;
    }

    /**
     * gets a rule by its id
     * 
     * @param ruleId that should be fetched
     * @returns a promise of the fetched Slo
     */
    async getSlo(ruleId: string): Promise<Slo> {
        const res = await this.getRuleResource();
        return res.spec.groups[0].rules.map(rule => K8sMapper.promRuleToSloRule(rule)).find(rule => rule.id === ruleId);
    }

    /**
     * creates a new SLO
     * 
     * @param rule to be created
     * @returns a promise of boolean to confirm if the creation was successful
     */
    async addSLO(rule: Slo): Promise<boolean> {
        return this.addOrUpdateSlo(rule);
    }

    /**
     * updates a SLO
     * 
     * @param rule to be updated
     * @returns a promise of boolean to confirm if the update was successful
     */
    async updateSlo(rule: Slo): Promise<boolean> {
        return this.addOrUpdateSlo(rule);
    }

    /**
     * updates or creates a Slo
     * 
     * @param rule to be updated or created
     * @returns a promise of boolean to confirm if the creation or update was successful
     */
    async addOrUpdateSlo(rule: Slo): Promise<boolean> {
        // If rule has no Id, create one
        if (!rule.id) {
            rule.id = uuidv4();
        }

        try {
            // Fetch the prometheusrule CRD where all rules are configured
            const res = await this.getRuleResource();
            // if prometheusrule CRD exits, apply the rule to it
            if (res) {
                this.addRuleAndApply(rule, res, true);
            }
        } catch (error) {
            // if prometheusrule CRD not found, create a prometheusrule CRD and apply slo to this CRD
            if (error.body.code === 404) {
                this.addRuleAndApply(rule, K8sMapper.createPrometheusRuleCrd(), false);
            } else {
                this.logger.error(error);
            }
        }

        try {
            // Fetch the probes CRD where all blackbox exporter targets are configured
            const res = await this.getProbeResource();
            if (res) {
                // if probes CRD exists, apply new probe target to it
                return this.addProbeAndApplyCrd(rule, res, true);
            }
        } catch (error) {
            // if probes CRD not found, create one and apply new probe target to it
            if (error.body.code === 404) {
                return this.addProbeAndApplyCrd(rule, K8sMapper.createProbersCrd(), false);
            } else {
                this.logger.error(error);
            }
        }
    }

    /**
     * Handles the kubernetes api process of applying a Slo to the cluster
     * 
     * @param sloRule to be applied
     * @param promRuleCrd the slo should be applied tp
     * @param isReplacing indicated wether the prometheusrule CRD should be created or overwritten
     * @returns a promise of boolean to indicate if the process was successful
     */
    private async addRuleAndApply(sloRule: Slo, promRuleCrd: PrometheusRuleCRD, isReplacing: boolean): Promise<boolean> {
        const promRule = K8sMapper.sloRuleToPromRule(sloRule);
        this.logger.debug(`Applying PrometheusRule with expression ${promRule.expr}`)

        const index = promRuleCrd.spec.groups[0].rules.findIndex(e => e.annotations.ruleId === sloRule.id);
        if (index == -1) {
            promRuleCrd.spec.groups[0].rules.push(K8sMapper.sloRuleToPromRule(sloRule));
        } else {
            promRuleCrd.spec.groups[0].rules[index] = K8sMapper.sloRuleToPromRule(sloRule);
        }

        if (isReplacing) {
            await this.k8sClientApi.replace(promRuleCrd);
        } else {
            await this.k8sClientApi.create(promRuleCrd);
        }
        this.logger.debug("Applied Prometheus Rule CRD successfully")
        return true;
    }

    /**
     * Handles the kubernetes api process of applying a new probe target to the blackbox exporter
     * 
     * @param sloRule the new probe target should be applied for
     * @param probesCrd the targets should be applied to
     * @param isReplacing indicated wether the probes CRD should be created or overwritten
     * @returns a promise of boolean to indicate if the process was successful
     */
    private async addProbeAndApplyCrd(slo: Slo, probesCrd: ProbesCRD, isReplacing: boolean): Promise<boolean> {
        const probeTargetUrl = `http://${slo.targetId}.svc.cluster.local`  // slo.targetId includes namespace
        this.logger.debug(`Applying probe target ${probeTargetUrl}`);
        
        if (probesCrd.spec.targets.staticConfig.static.includes(probeTargetUrl)) {
            this.logger.debug(`Probe target ${probeTargetUrl} already included in Probe Crd`);
            return true;
        } else {
            probesCrd.spec.targets.staticConfig.static.push(probeTargetUrl)
        }

        try {
            if (isReplacing) {
                await this.k8sClientApi.replace(probesCrd);
            } else {
                await this.k8sClientApi.create(probesCrd);
            }
            this.logger.debug("Applied Probes CRD successfully")
            return true;
        } catch (e) {
            this.logger.error("Error applying Probes CRD", JSON.stringify(e, undefined, "\t"));
            return false;
        }
    }

    /**
     * deletes a slo
     * 
     * @param ruleId to be deleted 
     * @returns a promise of boolean to indicate if the process was successful
     */
    async deleteSlo(ruleId: string): Promise<boolean> {
        const res = await this.getRuleResource();
        const index = res.spec.groups[0].rules.findIndex(e => e.annotations.ruleId === ruleId);
        res.spec.groups[0].rules.splice(index, 1);
        try {
            await this.k8sClientApi.replace(res);
            this.logger.debug("Delete Prometheus Rule CRD successfully")
            return true;
        } catch (e) {
            this.logger.error("Error deleting Prometheus Rule CRD", JSON.stringify(e));
            return false;
        }
    }

    /**
     * fetches a list of available targets an slo can be applied to, targets are kubernetes services for a namespace
     * 
     * @returns a list of available targets an slo can be applied to
     */
    async getTargets(): Promise<Target[]> {
        try {
            const namespaces = await this.k8sCoreApi.listNamespace();
            const solomonNamespaces = namespaces.body.items.filter(namespace => namespace.metadata.labels["solomon-deployed"] === "true");
            
            const res = await Promise.all(
                solomonNamespaces.map((async (namespace) => {
                    const res = await this.k8sCoreApi.listNamespacedService(namespace.metadata.name)
                    const list: Target[] = res.body.items.filter(service => service.metadata.labels.solomonTarget === "true").map((service) => {
                        return {
                            targetName: `${service.metadata.name}.${namespace.metadata.name}`,
                            targetId: service.metadata.uid,
                        };
                    });
                    return list;
                }))
            );
            return res.concat.apply([], res);
        } catch (e) {
            console.log(e);
        }
    }
}