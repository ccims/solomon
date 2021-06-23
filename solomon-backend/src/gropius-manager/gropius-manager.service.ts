import { Injectable, Logger } from "@nestjs/common";
import { request, gql } from 'graphql-request'
import { Alert } from "src/models/alert.interface";
import { GropiusIssue, GropiusProject } from "src/models/gropius.model";
import SloRule from "src/models/slo-rule.model";
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
        var components = [];

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
            const response = await request(this.gropiusUrl,getComponentsQuery,{ projectId: projectId});
            components = GropiusGqlMapper.mapGqlComponents(response);
        } catch (error){
            this.logger.error('Could not fetch Gropius components', error)
        }
        return components;
    }


    async createGropiusIssue(sloRule: SloRule, alert: Alert) {
        const issue: GropiusIssue = {
            title: sloRule.name,
            body: sloRule.description,
            componentIDs: [ sloRule.targetId ],
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
            const data = await request(this.gropiusUrl, queryIssue, { input: issue});
            const issueID = data.createIssue.issue.id;
            this.logger.log("CREATED ISSUE: ", issueID);
            return issueID;
        } catch (error) {
            this.logger.log("ERROR CREATING ISSUE: ", error);
        }
    }
}