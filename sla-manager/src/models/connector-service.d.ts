import SloRule from "./slo-rule.model";

export interface ConnectorService {

    /**
     * returns a list of all SLO rules / alarms that are active 
     */
    getRules(): Promise<SloRule[]>;

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
     * @param ruleName - name of the rule that should be deleted
     */
    deleteRule(ruleName: string): Promise<boolean>;
}