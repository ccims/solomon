import { Body, Controller, Delete, Get, Param, Post, Put, Logger } from '@nestjs/common';
import { ForwarderService } from './forwarder/forwarder.service';
import { SolomonInstanceConfig } from './models/config.model';
import SloRule from './models/slo-rule.model';

@Controller('rules')
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private forwarder: ForwarderService) {}


  @Get()
  getRules() {
    this.logger.log(`called getRules() ${this.forwarder.getRules()}`)
    return this.forwarder.getRules();
  }

  @Post('config')
  setConfig(@Body() config: SolomonInstanceConfig) {
    return this.forwarder.setConfig(config);
  }

  @Get('config')
  getConfig() {
    return this.forwarder.getConfig();
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
