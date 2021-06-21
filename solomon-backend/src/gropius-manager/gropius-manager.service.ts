import { Injectable, Logger } from "@nestjs/common";
import { request, gql } from 'graphql-request'
import { GropiusProject } from "src/models/gropius.model";
import { GropiusGqlMapper } from "./gropius.gql-mapper";

@Injectable()
export class GropiusManager {
    private readonly logger = new Logger(GropiusManager.name);

    gropiusUrl = 'http://localhost:8080/api';

    async getGropiusProjects(): Promise<GropiusProject[]> {
        var projects = [];

        const getProjectsQuery = gql`
            query GetAllProjects($filter: ProjectFilter) {
                projects(filterBy: $filter) {
                edges {
                    node {
                    id
                    name
                    description
                    owner {
                        id
                        username
                    }
                    components {
                        edges {
                        node {
                            id
                            name
                        }
                        }
                    }
                    }
                }
                }
            }
        `
        try {
            const response = await request(this.gropiusUrl,getProjectsQuery);
            projects = GropiusGqlMapper.mapGqlProjects(response);
        } catch (error){
            this.logger.error('Could not fetch Gropius projects', error)
        }
        return projects;
    }

    async getGropiusComponents(projectId: string): Promise<any[]> {


        return null;
    }
}