import { Body, Controller, Delete, Get, Param, Post, Put, Logger } from '@nestjs/common';
import { DeploymentEnvironment, SloRule, TargetType } from 'solomon-models';
import { ForwarderService } from './forwarder/forwarder.service';
import { GropiusManager } from './gropius-manager/gropius-manager.service';

@Controller('solomon')
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private forwarder: ForwarderService, private gropiusManager: GropiusManager) {}

  @Get('rules/:deploymentEnvironment')
  getRules(@Param('deploymentEnvironment') env: DeploymentEnvironment) {
    this.logger.log('called getRules()')
    return this.forwarder.getRules(env);
  }

  @Get('rules/:deploymentEnvironment/:id')
  getRule(@Param('deploymentEnvironment') env: DeploymentEnvironment, @Param('id') ruleId: string) {
    this.logger.log('called getRule()')
    return this.forwarder.getRule(ruleId, env);
  }

  @Post('rules')
  addRule(@Body() rule: SloRule) {
    this.logger.log('called addRule()');
    return this.forwarder.addRule(rule);
  }

  @Put('rules')
  updateRule(@Body() rule: SloRule) {
    this.logger.log('called updateRule(id)')
    return this.forwarder.updateRule(rule);
  }

  @Delete('rules/:deploymentEnvironment/:id')
  deleteRule(@Param('deploymentEnvironment') env: DeploymentEnvironment, @Param('id') ruleId: string) {
    this.logger.log('called deleteRule()')
    return this.forwarder.deleteRule(ruleId, env);
  }

  @Get('gropius/projects')
  getGropiusProjects() {
    this.logger.log('called getGropiusProjects');
    return this.gropiusManager.getGropiusProjects();
  }

  @Get('gropius/components/:projectId')
  getGropiusComponents(@Param('projectId') gropiusProjectId: string) {
    this.logger.log('called getGropiusComponents for project ${gropiusProjectId}');
    return this.gropiusManager.getGropiusComponents(gropiusProjectId);
  }

  @Get('targets/:deploymentEnvironment/:targetType?')
  getTargetList(@Param('deploymentEnvironment') env: DeploymentEnvironment, @Param('targetType') targetType: TargetType) {
    this.logger.log('called getTargets()')
    return this.forwarder.getTargets(env, targetType);
  }

  @Get('alarm-actions/:deploymentEnvironment')
  getAlarmActionList(@Param('deploymentEnvironment') env: DeploymentEnvironment) {
    this.logger.log('called getAlarmActions()')
    return this.forwarder.getAlarmActions(env)
  }

}
