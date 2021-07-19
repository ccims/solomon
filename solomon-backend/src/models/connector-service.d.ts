import { DeploymentEnvironment, SloRule, Target } from "solomon-models";
import { TargetType } from "solomon-models/dist/target.model";

/**
 * The interface to be used by the forwarder as well as all the connectors.
 * It defines the **basic operations every connector should implement**.
 */
export interface ConnectorService {

    /**
     * returns a list of all SLO rules / alarms that are active 
     * @param env - (optional) deployment environment for which the rules should be fetched
     */
    getRules(env?: DeploymentEnvironment): Promise<SloRule[]>;

    /**
     * returns an SLO rule for a specific ID
     * @param env - deployment environment for which the rule should be fetched
     * @param ruleId - the ID of the rule that should be fetched
     */
    getRule(ruleId: string, env: DeploymentEnvironment): Promise<SloRule>;

    /**
     * returns true if the new rule / alarm was added successfully and false if not
     * @param rule - rule that should be added
     */
    addRule(rule: SloRule): Promise<boolean>;

    /**
     * returns true if an exiting rule was updated successfully
     * @param rule - rule that should be updated
     */
    updateRule(rule: SloRule): Promise<boolean>;

    /**
     * returns true if rule was deleted successfully 
     * @param ruleId - ID of the rule that should be deleted
     * @param env - (optional) deployment environment for which the rule applies
     */
    deleteRule(ruleId: string, env?: DeploymentEnvironment): Promise<boolean>;

    /**
     * returns a list of all possible monitoring targets
     * @param env - the environment for which possible targets should be fetched
     */
    getTargets(env?: DeploymentEnvironment, targetType?: TargetType): Promise<Target[]>;
}