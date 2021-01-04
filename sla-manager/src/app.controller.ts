import { Body, Controller, Get, HttpServer, HttpService, Param, Post, Res, Response } from '@nestjs/common';
import SlaRule from './models/sla-rule.model';
import { SlaRulesService } from './sla-rules.service';

@Controller("rule")
export class AppController {
  constructor(private slaService: SlaRulesService, private http: HttpService) {}

  @Get()
  getRules() {
    return this.slaService.getRules();
  }

  @Get(":id")
  getRule(@Param() params) {
    return this.slaService.getRule(params.id);
  }

  @Post()
  addRule(@Body() rule: SlaRule) {
    return this.slaService.addRule(rule);
  }

  @Post(":id")
  setRule(@Body() rule: SlaRule) {
    return this.slaService.setRule(rule);
  }
}
