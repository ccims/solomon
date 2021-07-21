import { NotAcceptableException } from '@nestjs/common';
import { SloRule, DeploymentEnvironment, MetricOption, PresetOption, StatisticsOption, ComparisonOperator } from "solomon-models";


export default class XmlConverterService { 

  convertXml(xml: string): SloRule {
    var defaultRule: SloRule = {
      name: "",
      description: "",
    
      deploymentEnvironment: DeploymentEnvironment.KUBERNETES,
      targetId: "",
      gropiusProjectId: "",
      gropiusComponentId: "",
    
      preset: PresetOption.AVAILABILITY,
      metricOption: MetricOption.PROBE_SUCCESS,
      comparisonOperator: ComparisonOperator.LESS,
      statistic: StatisticsOption.AVG,
    
      threshold: undefined,
      period: undefined,
    };

    var xml2js = require('xml2js');
    const parser = new xml2js.Parser();

    parser.parseString(xml, function (err, res) {

          console.log(res);
          
          defaultRule.name = res.ServiceLevelObjective.$.name;
          defaultRule.description = res.ServiceLevelObjective.Obliged[0].Provider[0].Description[0];
          defaultRule.targetId = res.ServiceLevelObjective.Obliged[0].Provider[0].TargetId[0];
          defaultRule.gropiusProjectId = res.ServiceLevelObjective.Obliged[0].Provider[0].GropiusProjectId[0];
          defaultRule.gropiusComponentId = res.ServiceLevelObjective.Obliged[0].Provider[0].GropiusComponentId[0];
          

          var deployment = res.ServiceLevelObjective.Obliged[0].Provider[0].Deployment[0];
          if (deployment == DeploymentEnvironment.KUBERNETES) {
            defaultRule.deploymentEnvironment = DeploymentEnvironment.KUBERNETES;
          } else if (deployment == DeploymentEnvironment.AWS) {
            defaultRule.deploymentEnvironment = DeploymentEnvironment.AWS;
            defaultRule.targetType = res.ServiceLevelObjective.Obliged[0].Provider[0].TargetType[0];
            defaultRule.alertTopicArn = res.ServiceLevelObjective.Obliged[0].Provider[0].AlertTopicArn[0];
          } else {
            //throw new NotAcceptableException("Neither AWS or Kubernetes as deployment Env");
          }
          
          if(res.ServiceLevelObjective.Expression[0].Preset[0].$.type == "Custom"){
            defaultRule.preset = PresetOption.CUSTOM;
            var comp = res.ServiceLevelObjective.Expression[0].Preset[0].Predicate[0].$.type;
            if (comp in ComparisonOperator){
              defaultRule.comparisonOperator=comp;
              defaultRule.threshold = res.ServiceLevelObjective.Expression[0].Preset[0].Predicate[0].Value[0];
            } else {
              //throw new NotAcceptableException("Unsupported Comparison Operator");
            }

            var stat = res.ServiceLevelObjective.Expression[0].Preset[0].Predicate[0].Predicate[0].$.type;
            if (stat in StatisticsOption){
              defaultRule.statistic = stat;
            } else {
              //throw new NotAcceptableException("Unsupported Statistic Operator");
            }

            var met = res.ServiceLevelObjective.Expression[0].Preset[0].Predicate[0].Predicate[0].SLAParameter[0].Metric[0];
            if (met in MetricOption){
              defaultRule.metricOption = met;
            } else {
              //throw new NotAcceptableException("Unsupported Metric");
            }

          } else if(deployment == DeploymentEnvironment.KUBERNETES && res.ServiceLevelObjective.Expression[0].Preset[0].$.type in PresetOption){
            defaultRule.preset = res.ServiceLevelObjective.Expression[0].Preset[0].$.type;
            defaultRule.threshold = res.ServiceLevelObjective.Expression[0].Preset[0].Value[0];
          } else {
            //throw new NotAcceptableException("Unsupported Preset");
          }

          defaultRule.period = res.ServiceLevelObjective.EvaluationEvent[0].Schedule[0].Interval[0].Seconds[0];
          
        })
    
        
        return defaultRule;
  
  }
}
  