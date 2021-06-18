import { Injectable } from "@nestjs/common";

@Injectable()
export class GropiusManager {


    async getGropiusComponents(projectId: string): Promise<any[]> {
        // const res = await this.client.query({
        //     query: gql`
        //         query GetAllProjects($filter: ProjectFilter) {
        //             projects(filterBy: $filter) {
        //             edges {
        //                 node {
        //                 id
        //                 name
        //                 components {
        //                     edges {
        //                     node {
        //                         id
        //                         name
        //                     }
        //                     }
        //                 }
        //                 }
        //             }
        //             }
        //         }
        //     `
        // });
        // return res.data.projects.edges;

        return null;
    }
}