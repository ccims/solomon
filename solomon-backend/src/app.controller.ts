import { Body, Controller, Delete, Get, Param, Post, Put, Logger } from '@nestjs/common';
import { DeploymentEnvironment, Slo, TargetType } from 'solomon-models';
import { ForwarderService } from './forwarder/forwarder.service';
import { GropiusManager } from './gropius-manager/gropius-manager.service';

@Controller('solomon')
export class AppController {
    private readonly logger = new Logger(AppController.name);
    constructor(private forwarder: ForwarderService, private gropiusManager: GropiusManager) { }

    @Get('slos/:deploymentEnvironment')
    getSlos(@Param('deploymentEnvironment') env: DeploymentEnvironment) {
        this.logger.log('called getSlos()')
        return this.forwarder.getSlos(env);
    }

    @Get('slos/:deploymentEnvironment/:id')
    getSlo(@Param('deploymentEnvironment') env: DeploymentEnvironment, @Param('id') sloId: string) {
        this.logger.log('called getSlo()')
        return this.forwarder.getSlo(sloId, env);
    }

    @Post('slos')
    addSlo(@Body() slo: Slo) {
        this.logger.log('called addSlo()');
        return this.forwarder.addSLO(slo);
    }

    @Put('slos')
    updateSlo(@Body() slo: Slo) {
        this.logger.log('called updateSlo()')
        return this.forwarder.updateSlo(slo);
    }

    @Delete('slos/:deploymentEnvironment/:id')
    deleteSlo(@Param('deploymentEnvironment') env: DeploymentEnvironment, @Param('id') sloId: string) {
        this.logger.log('called deleteSlo()')
        return this.forwarder.deleteSlo(sloId, env);
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
        this.logger.log(`called getTargets() for Env: ${env} and targetType: ${targetType}`)
        return this.forwarder.getTargets(env, targetType);
    }

    @Get('alarm-actions/:deploymentEnvironment')
    getAlarmActionList(@Param('deploymentEnvironment') env: DeploymentEnvironment) {
        this.logger.log('called getAlarmActions()')
        return this.forwarder.getAlarmActions(env)
    }

}
