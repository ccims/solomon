import { DeploymentEnvironment, SloRule, Target } from "solomon-models";
import { TargetType } from "solomon-models/dist/target.model";

/**
 * The interface to be used by the forwarder as well as all the connectors.
 * It defines the **basic operations every connector should implement**.
 */
export interface ConnectorService {

    /**
     * returns a list of all SLOs that are active 
     * @param env - (optional) deployment environment for which the SLOs should be fetched
     */
    getSlos(env?: DeploymentEnvironment): Promise<SloRule[]>;

    /**
     * returns an SLO for a specific ID
     * @param env - deployment environment for which the SLO should be fetched
     * @param sloId - the ID of the SLO that should be fetched
     */
    getSlo(sloId: string, env: DeploymentEnvironment): Promise<SloRule>;

    /**
     * returns true if the new SLO was added successfully and false if not
     * @param slo - SLO that should be added
     */
    addSLO(slo: SloRule): Promise<boolean>;

    /**
     * returns true if an exiting SLO was updated successfully
     * @param slo - SLO that should be updated
     */
    updateSlo(slo: SloRule): Promise<boolean>;

    /**
     * returns true if SLO was deleted successfully 
     * @param sloId - ID of the SLO that should be deleted
     * @param env - (optional) deployment environment for which the SLO applies
     */
    deleteSlo(sloId: string, env?: DeploymentEnvironment): Promise<boolean>;

    /**
     * returns a list of all possible monitoring targets
     * @param env - the environment for which possible targets should be fetched
     */
    getTargets(env?: DeploymentEnvironment, targetType?: TargetType): Promise<Target[]>;
}