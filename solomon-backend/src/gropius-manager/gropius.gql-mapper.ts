import { Logger } from "@nestjs/common";
import { GropiusComponent, GropiusProject } from "src/models/gropius.model";

export class GropiusGqlMapper {
    private static readonly logger = new Logger(GropiusGqlMapper.name);

    private static mapGqlProject(gqlResponse: any): GropiusProject {
        const gropiusProject: GropiusProject = {
            id: gqlResponse.node.id,
            name: gqlResponse.node.name,
            description: gqlResponse.node.description
        }

        return gropiusProject;
    }

    static mapGqlProjects(gqlResponse: any): GropiusProject[] {
        var projects = [];
        gqlResponse.projects.edges.forEach(project => {
            projects.push(this.mapGqlProject(project));
        });
        return projects;
    }

    static mapGqlComponent(gqlResponse: any): GropiusComponent {
        const gropiusComponent: GropiusComponent = {
            id: gqlResponse.id,
            name: gqlResponse.name,
            description: gqlResponse.description
        }
        return gropiusComponent;
    }

    static mapGqlComponents(gqlResponse: any): GropiusComponent[] {
        var components = [];
        gqlResponse.node.components.nodes.forEach(component => {
            components.push(this.mapGqlComponent(component));
        });
        return components;
    }
}