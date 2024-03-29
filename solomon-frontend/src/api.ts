import Axios from "axios";
import { DeploymentEnvironment, Slo, Target, GropiusProject, GropiusComponent } from "solomon-models";



// const BACKEND_URL = "https://localhost:443/solomon";
const BACKEND_URL = "http://localhost:6400/solomon";
const RULES_API = `${BACKEND_URL}/slos`; // :deploymentEnvironment
const TARGET_API = `${BACKEND_URL}/targets`; // :deploymentEnvironment
const GROPIUS_API = `${BACKEND_URL}/gropius`;
const GROPIUS_PROJECT_API = `${GROPIUS_API}/projects`;
const GROPIUS_PROJECT_FULL_API = `${GROPIUS_API}/projects-full`;
const GROPIUS_COMPONENTS_API = `${GROPIUS_API}/components`; // :gropiusProjectId
const CREATE_ENVIRONMENT = `${BACKEND_URL}/environment`;
const TOGGLE_DEPLOYMENT = `${BACKEND_URL}/toggle-deployment`;
const ALARM_ACTION = `${BACKEND_URL}/alarm-actions`; // :deploymentEnvironment
const XML_CONVERT = `${BACKEND_URL}/sla-lang`

// const https = require('https');
// const agent = new https.Agent({ 
//     rejectUnauthorized: false
//   });

const axiosConfig = {
    // auth: {
    //     username: "sillystudent",
    //     password: "privatepassword",
    // },
    // httpsAgent: agent
}

export const fetchRules = async (env: DeploymentEnvironment): Promise<Slo[]> => {
    const res = await Axios.get<Slo[]>(`${RULES_API}/${env}`, axiosConfig);
    if (res.data as any === "") {   // why does api return ""?
        return null;
    }
    return res.data;
}

export const fetchRule = async (id: string, env: DeploymentEnvironment): Promise<Slo> => {
    const res = await Axios.get<Slo>(`${RULES_API}/${env}/${id}`);
    return res.data;
}

export const addRule = async (rule: Slo) => {
    const res = await Axios.post(`${RULES_API}`, rule, axiosConfig);
    return res.data;
}

export const updateRule = async (rule: Slo) => {
    const res = await Axios.put(`${RULES_API}`, rule, axiosConfig);
    return res.data;
}

export const deleteRule = async (ruleId: string, env: DeploymentEnvironment) => {
    const res = await Axios.delete(`${RULES_API}/${env}/${ruleId}`, axiosConfig);
    return res.data;
}

export const fetchTargets = async (env: DeploymentEnvironment, targetType: string): Promise<Target[]> => {
    const res = await Axios.get(targetType ? `${TARGET_API}/${env}/${targetType}` : `${TARGET_API}/${env}`, axiosConfig);
    if (res.data as any === "") {   // why does api return ""?
        return null;
    }
    return res.data;
}

export const fetchGropiusProjects = async (): Promise<GropiusProject[]> => {
    const res = await Axios.get(`${GROPIUS_PROJECT_API}`, axiosConfig);
    return res.data;
}

export const fetchGropiusProjectsFull = async (): Promise<GropiusProject[]> => {
    const res = await Axios.get(`${GROPIUS_PROJECT_FULL_API}`, axiosConfig);
    return res.data;
}

export const fetchGropiusComponents = async (gropiusProjectId: string): Promise<GropiusComponent[]> => {
    const res = await Axios.get(`${GROPIUS_COMPONENTS_API}/${gropiusProjectId}`, axiosConfig);
    return res.data;
}

export const fetchAlarmActionList = async (env: DeploymentEnvironment): Promise<string[]> => {
    const res = await Axios.get(`${ALARM_ACTION}/${env}`, axiosConfig);
    if (res.data as any === "") {   // why does api return ""?
        return null;
    }
    return res.data;
}

export const convertXml = async (xml: string) => {
    const res = await Axios.post(`${XML_CONVERT}`, xml, axiosConfig);
    return res.data;
}


// TODO: TS MODELS
export const createEnvironment = async (environment: any) => {
    const res = await Axios.post(`${CREATE_ENVIRONMENT}`, environment, axiosConfig);
    return res.data;
}

export const fetchEnvironment = async () => {
    const res = await Axios.get(`${CREATE_ENVIRONMENT}`, axiosConfig);
    return res.data;
}

export const toggleDeployment = async (environment: any, deployment: any): Promise<any> => {
    const res = await Axios.post(`${TOGGLE_DEPLOYMENT}`, { environment, deployment }, axiosConfig);
    return res.data;
}
