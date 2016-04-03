import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';

import Individual from '../Individual';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import OperatorContext from '../OperatorContext';

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
     * Run a trial
     */
    RunTrial(trialIndex: number): TrialResults{
        
        for (var index = 0; index < this.Trials; index++) {
            console.log("Runing GA!");
        }
        
        
        return;
    }
    
    /**
     * Returns a list of Mutated new individuals
     */
    CreatesFirstGeneration(original: Individual): Individual []{
        
        var localPopulation: Individual [] = [];
        localPopulation.push(original);
        
        for (var index = 0; index < this.individuals; index++) {
            var clone: Individual = original.Clone();
            var context: OperatorContext = new OperatorContext();
            
            context.First = clone;
            localPopulation.push(this.Mutate(context));
        }
        
        return localPopulation;
    }
    
}