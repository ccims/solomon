import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ForwarderService } from './forwarder/forwarder.service';
import SloRule from './models/slo-rule.model';

@Controller('rules')
export class AppController {
  constructor(private forwarder: ForwarderService) {}

  @Post('config')
  setMonitoringTool(@Body() selectionDto) {
    this.forwarder.setMonitoringTool(selectionDto.selection)
  }

  @Get()
  getRules() {
    console.log('called getRules()')
    return this.forwarder.getRules();
  }

  @Post()
  addRule(@Body() rule: SloRule) {
    console.log('called addRule()')
    return this.forwarder.addRule(rule);
  }

  @Put(':name')
  updateRule(@Body() rule: SloRule) {
    console.log('called updateRule(id)')
    return this.forwarder.updateRule(rule);
  }

  @Delete(':name')
  deleteRule(@Param('name') ruleName: string) {
    console.log('called deleteRule(id)')
    return this.forwarder.deleteRule(ruleName);
  }
}
