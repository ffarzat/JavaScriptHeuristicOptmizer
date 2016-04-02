import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';

/**
 * Genetic Algorithm for Code Improvement
 */
export default class GA extends IHeuristic {
    
    generations: number;
    individuals: number;
    crossoverProbability: number;
    mutationProbability: number;
    elitism: boolean;
    elitismPercentual: number;
    
     /**
     * Especific Setup
     */
    Setup(config: TrialEspecificConfiguration): void{
        
        super.Setup(config);
        
        this.generations = config.generations;
        this.individuals = config.individuals;
        this.crossoverProbability = config.crossoverProbability;
        this.mutationProbability = config.mutationProbability;
        this.elitism = config.elitism;
        this.elitismPercentual = config.elitismPercentual;
     
    }
    
    
    /**
     * Initializes all trials
     */
    RunTrial(trialIndex: number): TrialResults{
        
        for (var index = 0; index < this.Trials; index++) {
            console.log("Runing GA!");
        }
        
        
        return;
    }
}