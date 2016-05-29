import Individual from '../Individual';
import Library from '../Library';
import IHeuristic from '../heuristics/IHeuristic';


/**
 * TrialResult - Represents a Final result of an especific optmization trial
 */
export default class TrialResult {
    
    trial: number;
    library: Library;
    heuristic: IHeuristic;
    file: string;
    
    
    originalIndividualAvgTime:number;
    originalIndividualLOC: number;
    originalIndividualCharacters: number;
    
    bestIndividualAvgTime:number;
    bestIndividualLOC: number;
    bestIndividualCharacters: number;
    
    best: Individual;
    original: Individual;
    time: number; //time in minutes
}