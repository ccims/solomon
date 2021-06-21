import { Logger } from "@nestjs/common";
import { GropiusProject } from "src/models/gropius.model";

export class GropiusGqlMapper {
    private static readonly logger = new Logger(GropiusGqlMapper.name);

    private static mapGqlProject(gqlResponse: any): GropiusProject {
        const gropiusProject: GropiusProject = {
            id: gqlResponse.node.id,
            name: gqlResponse.node.name,
            description: gqlResponse.node.description,
            ownerId: gqlResponse.node.owner.id,
            ownerName: gqlResponse.node.owner.username
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
}