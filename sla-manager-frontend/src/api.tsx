import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import Axios from "axios"
import SlaRule from "./models/sla-rule.model";
import * as k8s from '@kubernetes/client-node';


// TODO: use env file
// TODO: Set production urls as kubernetes services
const slaManagerApi = "http://localhost:6400/rule/"
const prometheusApi = "http://localhost:9090/api/v1/"
const gropiusApi = "http://localhost:8080/api/"

// const kc = new k8s.KubeConfig();
// kc.loadFromDefault();

// const k8Client = k8s.KubernetesObjectApi.makeApiClient(kc);
// const k8sApi = kc.makeApiClient(k8s.CoreV1Api);


const client = new ApolloClient({
    uri: 'http://localhost:8080/api',   // TODO: Environment file
    cache: new InMemoryCache()
});

export const fetchRules = async (): Promise<SlaRule[]> => {
    const res = await Axios.get<SlaRule[]>(slaManagerApi);
    return res.data;
}

export const fetchRule = async (id: string): Promise<SlaRule> => {
    const res = await Axios.get<SlaRule>(`${slaManagerApi}${id}`);
    return res.data;
}

export const postRule = async (rule?: SlaRule) => {
    if (!(rule?.id)) return null;

    const res = await Axios.post(`${slaManagerApi}${rule.id}`, rule);
    return res.data;
}

export const addRule = async (rule?: SlaRule) => {
    if (!rule) return null;

    const res = await Axios.post(slaManagerApi, rule);
    return res.data;
}

export const fetchTargets = async (): Promise<string[]> => {
    const res = await Axios.get(prometheusApi + "targets");
    let targets = res.data.data.activeTargets.map((target: any) => {
        return target.labels.service;
    });

    // Filter out duplicates
    targets = targets.filter((v, i, a) => a.indexOf(v) === i);

    return targets;
}

export const fetchGropiusProjects = async (): Promise<any[]> => {
    // TODO: define gropius project model
    try {
        const res = await client.query({
            query: gql`
                query GetAllProjects($filter: ProjectFilter) {
                    projects(filterBy: $filter) {
                    edges {
                        node {
                        id
                        name
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
        });
        return res.data.projects.edges;
    } catch (e) {
        return null;
    }
}