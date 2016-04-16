import Individual from '../Individual';

/**
 * TrialResult - Represents a Final result of an especific optmization trial
 */
export default class TrialResult {
    
    trial: number;
    originalIndividualAvgTime:number;
    originalIndividualLOC: number;
    originalIndividualCharacters: number;
    
    bestIndividualAvgTime:number;
    bestIndividualLOC: number;
    bestIndividualCharacters: number;
    
    best: Individual;
    original: Individual;
}