import { Slo, DeploymentEnvironment, MetricOption, PresetOption, StatisticsOption, ComparisonOperator } from "solomon-models";


export default class XmlConverterService { 

  async convertXml(xml: string): Promise<Slo> {
    //Blueprint of a rule to return
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
        
        //Parse terms a touples with structure [name, content]
        try {
          var descTerms = [];
          res.Agreement.Terms[0].ServiceDescriptionTerm.forEach(element => {
            descTerms.push([element.$.ServiceName, element.Deployment[0]])
          });
          var propTerms = [];
          res.Agreement.Terms[0].ServiceProperties.forEach(element => {
            var customVariable = [element.Variable[0].$.Name, element.Variable[0].$.Metric];
            propTerms.push([element.$.ServiceName, customVariable])
          });  
          var guarTerms = [];
          res.Agreement.Terms[0].GuaranteeTerm.forEach(element => {
            var customSlo = element.ServiceLevelObjective[0].CustomServiceLevel[0];
            var slo = [customSlo.$.name, customSlo.$.description, customSlo.ComparisonOperator[0].$.type, 
              customSlo.ComparisonOperator[0].$.value, customSlo.ComparisonOperator[0].StatisticsOption[0].$.type,
              customSlo.ComparisonOperator[0].StatisticsOption[0]._, customSlo.MonitoringPeriod[0]];
              guarTerms.push([element.ServiceScope[0].$.ServiceName, slo])
          }); 
        } catch (error) {
          reject("Error parsing XML, there might be a problem with the formatting: " + error)
        }

        //Find Terms with corresponding Service and create Slos
        //If one of the fields is empty/filled incorrectly in the xml, ignore it
        var sloRules= [];
        guarTerms.forEach(element => {
          var fDescTerm = descTerms.filter((desc) => desc[0] == element[0] && desc[0].length > 0);
          var fPropTerm = propTerms.filter((prop) => prop[0] == element[0] && prop[0].length > 0);
          if (fPropTerm.length > 0 && fDescTerm.length > 0) {
            var sloToup = element[1];
            var depl = fDescTerm[0][1];
            var varToup = fPropTerm[0][1];
            defaultRule.name = sloToup[0];
            defaultRule.description = sloToup[1];
            defaultRule.preset = PresetOption.CUSTOM;
            if (Object.values(ComparisonOperator).includes(sloToup[2])){
              defaultRule.comparisonOperator = sloToup[2];
            }
            if(!isNaN(+sloToup[3])){
              defaultRule.threshold = Number(sloToup[3]);
            }
            if (Object.values(StatisticsOption).includes(sloToup[4])){
              defaultRule.statistic = sloToup[4];
            }
            if(!isNaN(+sloToup[6])){
              defaultRule.period = Number(sloToup[6]);
            }
            if (Object.values(DeploymentEnvironment).includes(depl)){
              defaultRule.deploymentEnvironment = depl;
            }
            if (sloToup[5] === varToup[0]){
              if (Object.values(MetricOption).includes(varToup[1])){
                defaultRule.metricOption = varToup[1];
              }
            }
            sloRules.push(defaultRule);
          }
        });
        if (sloRules.length > 0) {
          resolve(sloRules[0]);
        } else {
          reject("No SLO found");
        }   
      }).catch((error) => {
        reject("Error reading File, there might be a problem with the formatting: " + error)
      });
  });   
  }
}
  