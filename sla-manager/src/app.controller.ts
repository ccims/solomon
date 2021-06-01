import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { ForwarderService } from './forwarder/forwarder.service';
import SloRule, { DeploymentEnvironment } from './models/slo-rule.model';

@Controller('rules')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private forwarder: ForwarderService) {}

  @Post('config')
  setSelectedDeploymentEnvironment(@Body() selectionDto) {
    this.forwarder.setSelectedDeploymentEnvironment(selectionDto.selection)
  }

  @Get()
  getRules() {
    this.logger.log('called getRules()')
    return this.forwarder.getRules();
  }

  @Get(':deploymentEnvironment/targets')
  getTargetList(@Param('deploymentEnvironment') deplyomentEnvironment: DeploymentEnvironment) {
    this.logger.log('called getTargets()')
    return this.forwarder.getTargets(deplyomentEnvironment);
  }

  @Post()
  addRule(@Body() rule: SloRule) {
    this.logger.log('called addRule()')
    return this.forwarder.addRule(rule);
  }

  @Put(':name')
  updateRule(@Body() rule: SloRule) {
    this.logger.log('called updateRule(id)')
    return this.forwarder.updateRule(rule);
  }

  @Delete(':name')
  deleteRule(@Param('name') ruleName: string) {
    this.logger.log('called deleteRule(id)')
    return this.forwarder.deleteRule(ruleName);
  }
}
