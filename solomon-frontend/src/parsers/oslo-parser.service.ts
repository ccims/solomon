import { Slo, DeploymentEnvironment, MetricOption, PresetOption, StatisticsOption, ComparisonOperator } from "solomon-models";
import jsyaml from "js-yaml";

export default class OSLOParserSerivce {

    async parseOSLO(yamlString): Promise<Slo>{
        //Blueprint of a rule to return
        var defaultRule: Slo = {
            name: undefined,  
            deploymentEnvironment: DeploymentEnvironment.KUBERNETES,
            targetId: undefined, 
            threshold: undefined,
            period: undefined,
      };
        return new Promise((resolve, reject) => {
            try {
                //Object from string
                var yamlRule = jsyaml.load(yamlString);
                
                //Check formalities
                if (yamlRule.apiVersion != 'openslo/v1alpha') {
                    reject("Unsupported api version");
                }
                if (yamlRule.kind != 'SLO') {
                    reject("Unsupported kind");
                }

                //Fill defaultRule according to yaml file, empty/incorrectly filled fields are skipped, format errors lead to rejection
                defaultRule.name = yamlRule.metadata.name;
                defaultRule.description = yamlRule.spec.description;
                defaultRule.preset = PresetOption.CUSTOM;

                var metric = yamlRule.spec.indicator.thresholdMetric;
                if (Object.values(MetricOption).includes(metric.source)){
                    defaultRule.metricOption = metric.source;
                }
                if (metric.queryType == 'statistic' && Object.values(StatisticsOption).includes(metric.query)) {
                    defaultRule.statistic = metric.query;  
                }

                if (Object.values(DeploymentEnvironment).includes(metric.metadata.deployment)){
                    defaultRule.deploymentEnvironment = metric.metadata.deployment;
                }

                var objective = yamlRule.spec.objectives;
                if (Object.values(ComparisonOperator).includes(objective.op)){
                    defaultRule.comparisonOperator = objective.op;
                }
                if(!isNaN(objective.value)){
                    defaultRule.threshold = objective.value;
                }

                //Time window conversion according to unit
                var timeWindow = yamlRule.spec.timeWindows[0];
                if (timeWindow.isRolling && !isNaN(timeWindow.count)){
                    switch (timeWindow.unit) {
                        case 'Millisecond':
                            defaultRule.period = timeWindow.count/1000;
                            break;
                        case 'Second':
                            defaultRule.period = timeWindow.count;
                            break;
                        case 'Minute':
                            defaultRule.period = timeWindow.count*60;
                            break;
                        case 'Hour':
                            defaultRule.period = timeWindow.count*3600;
                            break;
                    }
                }
                resolve(defaultRule);
            } catch (error) {
                reject("Error parsing yaml: " + error);
            } 
        })
    }
}