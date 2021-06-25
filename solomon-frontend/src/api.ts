import Axios from "axios";
import { DeploymentEnvironment, SloRule, Target } from "solomon-models";



const BACKEND_URL = "https://localhost:443/solomon";
const RULES_API = `${BACKEND_URL}/rules`; // :deploymentEnvironment
const TARGET_API = `${BACKEND_URL}/targets`; // :deploymentEnvironment
const GROPIUS_COMPONENTS_API = `${BACKEND_URL}/gropius-projects`; // :gropiusProjectId

const https = require('https');
const agent = new https.Agent({ 
    rejectUnauthorized: false
  });

const axiosConfig = {
    auth: {
        username: "sillystudent",
        password: "privatepassword",
    },
    httpsAgent: agent
}

export const fetchRules = async (env: DeploymentEnvironment): Promise<SloRule[]> => {
    const res = await Axios.get<SloRule[]>(`${RULES_API}/${env}`, axiosConfig);
    if (res.data as any === "") {   // why does api return ""?
        return null;
    }
    return res.data;
}

// TODO: ?
// export const fetchRule = async (id: string): Promise<SlaRule> => {
//     const res = await Axios.get<SlaRule>(`${slaManagerApi}${id}`);
//     return res.data;
// }

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

export const fetchGropiusComponents = async (gropiusProjectId: string): Promise<any[]> => {
    const res = await Axios.get(`${GROPIUS_COMPONENTS_API}/${gropiusProjectId}`, axiosConfig);
    return res.data;
}