import { Slo, DeploymentEnvironment, MetricOption, PresetOption, StatisticsOption, ComparisonOperator } from "solomon-models";

export default class SLOmlParserSerivce {

    async parseSLOml(jsonString): Promise<Slo>{
        //Blueprint of a rule to return
        var defaultRule: Slo = {
            name: undefined,  
            deploymentEnvironment: DeploymentEnvironment.KUBERNETES,
            targetId: undefined, 
            threshold: undefined,
            period: undefined,
      };
        return new Promise((resolve, reject) => {

            //Object from JSON
            var jsonRule = JSON.parse(jsonString);
            var sloRules = [];
            try {
                Object.entries(jsonRule).forEach( (key, index) => {
                    var component = key[1] as any;
                    component.SLOs.forEach((element) => {

                        //Fill defaultRule according to yaml file, empty/incorrectly filled fields are skipped, format errors lead to rejection
                        defaultRule.name = element.name;
                        defaultRule.description = element.description;
                        defaultRule.preset = PresetOption.CUSTOM;
                        if (Object.values(ComparisonOperator).includes(element.operator)){
                            defaultRule.comparisonOperator = element.operator;
                        }
                        if(!isNaN(+element.value)){
                            defaultRule.threshold = Number(element.value);
                        }
                        if (Object.values(StatisticsOption).includes(element.statistic)){
                            defaultRule.statistic = element.statistic;
                        }
                        if(!isNaN(+element.period)){
                            defaultRule.period = Number(element.period);
                        }
                        if (Object.values(DeploymentEnvironment).includes(component.config.deployment)){
                            defaultRule.deploymentEnvironment = component.config.deployment;
                        }
                        if (Object.values(MetricOption).includes(element.metric)){
                            defaultRule.metricOption = element.metric;
                        }
                        sloRules.push(defaultRule);
                    })
                });
                resolve(sloRules[0]); 
            } catch (error) {
                reject("Error with formatting: " + error)
            }
            
            
        })
    }
}