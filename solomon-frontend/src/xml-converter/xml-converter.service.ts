import { Slo, DeploymentEnvironment, MetricOption, PresetOption, StatisticsOption, ComparisonOperator, TargetType } from "solomon-models";


export default class XmlConverterService { 

  async convertXml(xml: string): Promise<Slo> {
    //The Rule-Object to return
    var defaultRule: Slo = {
      name: undefined,  
      deploymentEnvironment: DeploymentEnvironment.KUBERNETES,
      targetId: undefined, 
      threshold: undefined,
      period: undefined,
    };

    //Promise returns filled SloRule on resolve and reason on reject.
    return new Promise((resolve, reject) => {
      var xml2js = require('xml2js');
      const parser = new xml2js.Parser();
      parser.parseStringPromise(xml).then(function (res) {
        //If one of the fields isnt defined in the xml, set them to empty
        try {
          defaultRule.name = res.ServiceLevelObjective.$.name;
        } catch (error) {
          defaultRule.name = "";
        }
        try {
          defaultRule.description = res.ServiceLevelObjective.Obliged[0].Provider[0].Description[0];
        } catch (error) {
          defaultRule.description ="";
        }
        try {
          defaultRule.targetId = res.ServiceLevelObjective.Obliged[0].Provider[0].TargetId[0];
        } catch (error) {
          defaultRule.targetId = "";
        }
        try {
          defaultRule.gropiusProjectId = res.ServiceLevelObjective.Obliged[0].Provider[0].GropiusProjectId[0];
        } catch (error) {
          defaultRule.gropiusProjectId = "";
        }
        try {
          defaultRule.gropiusComponentId = res.ServiceLevelObjective.Obliged[0].Provider[0].GropiusComponentId[0];
        } catch (error) {
          defaultRule.gropiusProjectId = "";
        }

        //If one of the Values given isnt compatible, reject
        try {
          var deployment = res.ServiceLevelObjective.Obliged[0].Provider[0].Deployment[0];
          if (deployment === DeploymentEnvironment.KUBERNETES) {
            defaultRule.deploymentEnvironment = DeploymentEnvironment.KUBERNETES;
          } else if (deployment === DeploymentEnvironment.AWS) {
            defaultRule.deploymentEnvironment = DeploymentEnvironment.AWS;
            try {
              var tType = res.ServiceLevelObjective.Obliged[0].Provider[0].TargetType[0];
              if (Object.values(TargetType).includes(tType)) {
                defaultRule.targetType = tType;
              } else {
                reject("Unsupported TargetType");
              }
            } catch (error) {
              defaultRule.targetType = TargetType.AWS_APIGATEWAY;
            }
            try {
              defaultRule.alertTopicArn = res.ServiceLevelObjective.Obliged[0].Provider[0].AlertTopicArn[0];
            } catch (error) {
              defaultRule.alertTopicArn = "";
            }  
          } else {
              reject("Unsupported Deployment Environment");
          }
        } catch (error) {
          defaultRule.deploymentEnvironment = DeploymentEnvironment.KUBERNETES;
        }
        
        try {
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
        } catch (error) {
          defaultRule.preset = PresetOption.CUSTOM;
          defaultRule.threshold = undefined;
        }

        try {
          defaultRule.period = res.ServiceLevelObjective.EvaluationEvent[0].Schedule[0].Interval[0].Seconds[0];
        } catch (error) {
          defaultRule.period = undefined;
        }
        
        resolve(defaultRule);
      }).catch((error) => {
        reject("Error parsing XML, there might be a problem with the formatting: " + error)
      });
  });
    
    
      

  }
}
  