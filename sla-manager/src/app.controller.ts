import { Body, Controller, Delete, Get, Param, Post, Put, Logger } from '@nestjs/common';
import { ForwarderService } from './forwarder/forwarder.service';
import SloRule, { DeploymentEnvironment } from './models/slo-rule.model';
import { SolomonInstanceConfig } from './models/config.model';

@Controller('solomon')
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private forwarder: ForwarderService) {}


  @Get('rules/:deploymentEnvironment')
  getRules(@Param('deploymentEnvironment') env: DeploymentEnvironment) {
    this.logger.log('called getRules()')
    return this.forwarder.getRules(env);
  }

  @Get('targets/:deploymentEnvironment')
  getTargetList(@Param('deploymentEnvironment') env: DeploymentEnvironment) {
    this.logger.log('called getTargets()')
    return this.forwarder.getTargets(env);
  }
  
  // @Post('config')
  // setConfig(@Body() config: SolomonInstanceConfig) {
  //   return this.forwarder.setConfig(config);
  // }

  // @Get('config')
  // getConfig() {
  //   return this.forwarder.getConfig();
  // }

  @Post('rules')
  addRule(@Body() rule: SloRule) {
    this.logger.log('called addRule()')
    return this.forwarder.addRule(rule);
  }

  @Put('rules/:name')
  updateRule(@Body() rule: SloRule) {
    this.logger.log('called updateRule(id)')
    return this.forwarder.updateRule(rule);
  }

  @Delete('rules/:deploymentEnvironment/:name')
  deleteRule(@Param('deploymentEnvironment') env: DeploymentEnvironment, @Param('name') ruleName: string) {
    this.logger.log('called deleteRule()')
    return this.forwarder.deleteRule(ruleName, env);
  }
}
