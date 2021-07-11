import Axios from "axios";
import { DeploymentEnvironment, SloRule, Target, GropiusProject, GropiusComponent } from "solomon-models";



// const BACKEND_URL = "https://localhost:443/solomon";
const BACKEND_URL = "http://localhost:6400/solomon";
const RULES_API = `${BACKEND_URL}/rules`; // :deploymentEnvironment
const TARGET_API = `${BACKEND_URL}/targets`; // :deploymentEnvironment
const GROPIUS_API = `${BACKEND_URL}/gropius`;
const GROPIUS_PROJECT_API = `${GROPIUS_API}/projects`; 
const GROPIUS_COMPONENTS_API = `${GROPIUS_API}/components`; // :gropiusProjectId
const ALARM_ACTION = `${BACKEND_URL}/alarm-actions`; // :deploymentEnvironment

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

export const fetchRules = async (env: DeploymentEnvironment): Promise<SloRule[]> => {
    const res = await Axios.get<SloRule[]>(`${RULES_API}/${env}`, axiosConfig);
    if (res.data as any === "") {   // why does api return ""?
        return null;
    }
    return res.data;
}

export const fetchRule = async (id: string, env: DeploymentEnvironment): Promise<SloRule> => {
    const res = await Axios.get<SloRule>(`${RULES_API}/${env}/${id}`);
    return res.data;
}

export const postRule = async (rule: SloRule) => {
    const res = await Axios.post(`${RULES_API}`, rule, axiosConfig);
    return res.data;
}

export const fetchTargets = async (env: DeploymentEnvironment): Promise<Target[]> => {
    const res = await Axios.get(`${TARGET_API}/${env}`, axiosConfig);
    if (res.data as any === "") {   // why does api return ""?
        return null;
    }
    return res.data;
}

export const fetchGropiusProjects = async (): Promise<GropiusProject[]> => {
    const res = await Axios.get(`${GROPIUS_PROJECT_API}`, axiosConfig);
    return res.data;
}

export const fetchGropiusComponents = async (gropiusProjectId: string): Promise<GropiusComponent[]> => {
    const res = await Axios.get(`${GROPIUS_COMPONENTS_API}/${gropiusProjectId}`, axiosConfig);
    return res.data;
}

export const fetchAlarmActionList = async (env: DeploymentEnvironment): Promise<string[]> => {
    const res = await Axios.get(`${ALARM_ACTION}/${env}`, axiosConfig);
    console.log("ALARM", res.data);
    if (res.data as any === "") {   // why does api return ""?
        return null;
    }
    return res.data;
}