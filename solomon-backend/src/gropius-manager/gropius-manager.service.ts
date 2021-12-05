import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { request, gql } from 'graphql-request'
import { SloAlert } from "src/models/alert.interface";
import { GropiusComponent, GropiusIssue, GropiusProject } from "src/models/gropius.model";
import { GropiusGqlMapper } from "./gropius.gql-mapper";

@Injectable()
export class GropiusManager {
    private readonly logger = new Logger(GropiusManager.name);
    private readonly configService = new ConfigService();

    private gropiusUrl = this.configService.get('GROPIUS_URL');

    /**
     * fetches all existing Gropius projects
     * @returns a list of Gropius projects
     */
    async getGropiusProjects(): Promise<GropiusProject[]> {
        let projects = [];

        const getProjectsQuery = gql`
           query GetAllProjects($filter: ProjectFilter) {
                projects(filterBy: $filter) {
                    edges {
                        node {
                            id
                            name
                            description
                        }
                    }
                }
            }
        `
        try {
            const response = await request(this.gropiusUrl, getProjectsQuery);
            projects = GropiusGqlMapper.mapGqlProjects(response);
        } catch (error) {
            this.logger.error('Could not fetch Gropius projects', error)
        }
        return projects;
    }

    /**
     * fetches all existing Gropius projects with its components
     * @returns a list of Gropius projects with its components
     */
    async getGropiusProjectsFull(): Promise<GropiusProject[]> {
        let projects = [];

        const getProjectsQuery = gql`
            query GetAllProjects($filter: ProjectFilter) {
                projects(filterBy: $filter) {
                edges {
                    node {
                    id
                    name
                    description
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
            const response = await request(this.gropiusUrl, getProjectsQuery);
            projects = GropiusGqlMapper.mapGqlProjects(response);
        } catch (error) {
            this.logger.error('Could not fetch Gropius projects full', error)
        }
        return projects;
    }

    /**
     * Fetches all the components of a project in Gropius
     * @param projectId the ID of the Gropius project of which the components should be fetched
     * @returns a list of Gropius Components
     */
    async getGropiusComponents(projectId: string): Promise<GropiusComponent[]> {
        let components = [];

        const getComponentsQuery = gql`
            query GetComponentsOfProject($projectId: ID!) {
                node(id: $projectId) {
                    ...on Project {
                        components {
                            nodes {
                                id
                                name
                                description
                            }
                        }
                    }
                }
            }
        `

        try {
            const response = await request(this.gropiusUrl, getComponentsQuery, { projectId: projectId });
            components = GropiusGqlMapper.mapGqlComponents(response);
        } catch (error) {
            this.logger.error('Could not fetch Gropius components', error)
        }
        return components;
    }

    /**
     * creates a new issues in Gropius which corresponds to the SLO violation indicated by the alert
     * @param alert alert for which an issue should be created
     * @returns the issue ID of the created issue
     */
    async createGropiusIssue(alert: SloAlert): Promise<string> {
        const issue: GropiusIssue = {
            title: alert.alertName,
            body: alert.alertDescription,
            componentIDs: [alert.gropiusComponentId],
        }

        const queryIssue = gql`
            mutation createIssue($input: CreateIssueInput!) {
                createIssue(input: $input) {
                    issue {
                        id
                    }
                }
            }
        `;

        try {
            const data = await request(this.gropiusUrl, queryIssue, { input: issue });
            const issueID = data.createIssue.issue.id;
            this.logger.log("CREATED ISSUE: " + issueID);
            return issueID;
        } catch (error) {
            this.logger.log("ERROR CREATING ISSUE: " + error);
        }
    }
}