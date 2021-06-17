import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import Axios from "axios";
import { SloRule, Target, DeploymentEnvironment } from "solomon-models/";


const slaManagerApi = "http://localhost:6400/rules/"

const BACKEND_URL = "https://localhost:443/solomon";
const RULES_API = `${BACKEND_URL}/rules`; // :deploymentEnvironment
const TARGET_API = `${BACKEND_URL}/targets`; // :deploymentEnvironment
const GROPIUS_COMPONENTS_API = `${BACKEND_URL}/gropius-projects`; // :gropiusProjectId


export const fetchRules = async (env: DeploymentEnvironment): Promise<SloRule[]> => {
    const res = await Axios.get<SloRule[]>(`${RULES_API}/${env}`);
    return res.data;
}

// TODO: ?
// export const fetchRule = async (id: string): Promise<SlaRule> => {
//     const res = await Axios.get<SlaRule>(`${slaManagerApi}${id}`);
//     return res.data;
// }

export const postRule = async (rule: SloRule) => {
    const res = await Axios.post(`${RULES_API}`, rule);
    return res.data;
}

export const fetchTargets = async (env: DeploymentEnvironment): Promise<Target[]> => {
    const res = await Axios.get(`${TARGET_API}/${env}`);
    return res.data;
    // let targets = res.data.data.activeTargets.map((target: any) => {
    //     return target.labels.service;
    // });

    // // Filter out duplicates
    // targets = targets.filter((v, i, a) => a.indexOf(v) === i);

    // return targets;
}

export const fetchGropiusComponents = async (gropiusProjectId: string): Promise<any[]> => {
    const res = await Axios.get(`${TARGET_API}/${gropiusProjectId}`);
    return res.data;
}

// export const fetchConfig = async (): Promise<SolomonInstanceConfig> => {
//     const res = await Axios.get<SolomonInstanceConfig>(`${slaManagerApi}config`);
//     return res.data;
// }

// export const setConfig = async (config: SolomonInstanceConfig): Promise<boolean> => {
//     const res = await Axios.post(`${slaManagerApi}config`, config);
//     return res.data;
// }

// TODO: Move to Backend

// const prometheusApi = "http://localhost:9090/api/v1/"
// const gropiusApi = "http://localhost:8080/api/"

// const client = new ApolloClient({
//     uri: 'http://localhost:8080/api',   // TODO: Environment file
//     cache: new InMemoryCache()
// });

// export const fetchGropiusProjects = async (): Promise<any[]> => {
//     // TODO: define gropius project model
//     try {
//         const res = await client.query({
//             query: gql`
//                 query GetAllProjects($filter: ProjectFilter) {
//                     projects(filterBy: $filter) {
//                     edges {
//                         node {
//                         id
//                         name
//                         components {
//                             edges {
//                             node {
//                                 id
//                                 name
//                             }
//                             }
//                         }
//                         }
//                     }
//                     }
//                 }
//             `
//         });
//         return res.data.projects.edges;
//     } catch (e) {
//         return null;
//     }
// }