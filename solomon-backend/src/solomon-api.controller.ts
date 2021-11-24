import { Body, Controller, Delete, Get, Param, Post, Put, Logger } from '@nestjs/common';
import { DeploymentEnvironment, Slo, TargetType } from 'solomon-models';
import K8sEnvironment, { K8sDeployment } from './connector-kubernetes/k8s-environment.interface';
import { ForwarderService } from './forwarder/forwarder.service';
import { GropiusManager } from './gropius-manager/gropius-manager.service';

@Controller('solomon')
export class SolomonApi {
    private readonly logger = new Logger(SolomonApi.name);
    constructor(private forwarder: ForwarderService, private gropiusManager: GropiusManager) { }

    @Get('slos/:deploymentEnvironment')
    getSlos(@Param('deploymentEnvironment') env: DeploymentEnvironment) {
        this.logger.log('called getSlos()', env)
        return this.forwarder.getSlos(env);
    }

    @Get('slos/:deploymentEnvironment/:id')
    getSlo(@Param('deploymentEnvironment') env: DeploymentEnvironment, @Param('id') sloId: string) {
        this.logger.log('called getSlo()', env)
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

    @Get('gropius/projects-full')
    async getGropiusProjectsFull() {
        this.logger.log('called getGropiusProjectsFull');
        return this.gropiusManager.getGropiusProjectsFull();
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
    
    @Post('environment')
    createEnvironment(@Body() env: K8sEnvironment) {
        this.logger.log('called createEnvironment()')
        return this.forwarder.createEnvironment(env);
    }
    
    @Get('environment')
    getEnvironments() {
        this.logger.log('called getEnvironment()')
        return this.forwarder.getEnvironments();
    }
    
    @Post('toggle-deployment')
    async toggleDeployment(@Body() body: { environment: K8sEnvironment, deployment: K8sDeployment }) {
        this.logger.log(`called toggle Deplyoment ${body}`, )
        return this.forwarder.toggleDeployment( body.environment, body.deployment );
    }

}
