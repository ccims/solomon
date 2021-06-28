import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { LoggerService } from '@nestjs/common/services/logger.service';
import { SloRule, Target, DeploymentEnvironment, MetricOption, PresetOption, StatisticsOption, ComparisonOperator } from "solomon-models";
import xml2js from 'xml2js';


@Injectable()
export class XmlConverterService { //implements ConnectorPluginService

  convertXml(xml: string): Promise<boolean> {
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
    const parser = new xml2js.Parser();

    parser.parseStringPromise(xml)
        .then(function (res) {
          defaultRule.name = res.ServiceLevelObjective.$.name;
          defaultRule.description = "Created from XML";
          defaultRule.targetId = "...";
        })
        .catch(function (err)  {
            console.error(err);
        })
    
    return
    
  }
}
  