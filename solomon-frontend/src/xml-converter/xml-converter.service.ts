import { SloRule, DeploymentEnvironment, MetricOption, PresetOption, StatisticsOption, ComparisonOperator } from "solomon-models";


export default class XmlConverterService { 

  async convertXml(xml: string): Promise<SloRule> {
    var defaultRule: SloRule = {
      name: "",
      description: "",
    
      deploymentEnvironment: DeploymentEnvironment.KUBERNETES,
      targetId: undefined,
      gropiusProjectId: undefined,
      gropiusComponentId: undefined,
    
      preset: PresetOption.AVAILABILITY,
      metricOption: MetricOption.PROBE_SUCCESS,
      comparisonOperator: ComparisonOperator.LESS,
      statistic: StatisticsOption.AVG,
    
      threshold: undefined,
      period: undefined,
    };

    return new Promise((resolve, reject) => {
      var xml2js = require('xml2js');
      const parser = new xml2js.Parser();
      parser.parseStringPromise(xml).then(function (res) {
        defaultRule.name = res.ServiceLevelObjective.$.name;
        defaultRule.description = res.ServiceLevelObjective.Obliged[0].Provider[0].Description[0];
        defaultRule.targetId = res.ServiceLevelObjective.Obliged[0].Provider[0].TargetId[0];
        defaultRule.gropiusProjectId = res.ServiceLevelObjective.Obliged[0].Provider[0].GropiusProjectId[0];
        defaultRule.gropiusComponentId = res.ServiceLevelObjective.Obliged[0].Provider[0].GropiusComponentId[0];
        

        var deployment = res.ServiceLevelObjective.Obliged[0].Provider[0].Deployment[0];
        if (deployment === DeploymentEnvironment.KUBERNETES) {
          defaultRule.deploymentEnvironment = DeploymentEnvironment.KUBERNETES;
        } else if (deployment === DeploymentEnvironment.AWS) {
          defaultRule.deploymentEnvironment = DeploymentEnvironment.AWS;
          defaultRule.targetType = res.ServiceLevelObjective.Obliged[0].Provider[0].TargetType[0];
          defaultRule.alertTopicArn = res.ServiceLevelObjective.Obliged[0].Provider[0].AlertTopicArn[0];
        } else {
            reject("Unsupported Deployment Environment");
        }
        
        if(res.ServiceLevelObjective.Expression[0].Preset[0].$.type === "Custom"){
          defaultRule.preset = PresetOption.CUSTOM;
          var comp = res.ServiceLevelObjective.Expression[0].Preset[0].Predicate[0].$.type;
          if (Object.values(ComparisonOperator).includes(comp)){
            defaultRule.comparisonOperator=comp;
            
          } else {
            
              reject("Unsupported Comparison Operator");
          
          }

          var stat = res.ServiceLevelObjective.Expression[0].Preset[0].Predicate[0].Predicate[0].$.type;
          if (Object.values(StatisticsOption).includes(stat)){
            defaultRule.statistic = stat;
          } else {
            
              reject("Unsupported Statistic Operator");
            
          }

          var met = res.ServiceLevelObjective.Expression[0].Preset[0].Predicate[0].Predicate[0].SLAParameter[0].Metric[0];
          if (Object.values(MetricOption).includes(met)){
            defaultRule.metricOption = met;
          } else {
            reject("Unsupported Metric")    
          }
          defaultRule.threshold = res.ServiceLevelObjective.Expression[0].Preset[0].Predicate[0].Value[0];

        } else if(deployment === DeploymentEnvironment.KUBERNETES &&  Object.values(PresetOption).includes(res.ServiceLevelObjective.Expression[0].Preset[0].$.type)){
          defaultRule.preset = res.ServiceLevelObjective.Expression[0].Preset[0].$.type;
          defaultRule.threshold = res.ServiceLevelObjective.Expression[0].Preset[0].Value[0];
        } else {
            reject("Unsupported Preset Type")  
        }

        defaultRule.period = res.ServiceLevelObjective.EvaluationEvent[0].Schedule[0].Interval[0].Seconds[0];
        console.log("resolving Promise")
        resolve(defaultRule);
      }).catch((error) => {
        reject("Error parsing XML, there might be a problem with the formatting: " + error)
      });
  });
    
    
      

  }
}
  