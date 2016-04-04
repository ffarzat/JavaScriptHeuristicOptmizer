import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';

import Individual from '../Individual';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import OperatorContext from '../OperatorContext';
import ILogger from '../ILogger';

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
    
    bestFit: number;
    bestIndividual: Individual;
    
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
    RunTrial(trialIndex: number, original: Individual): TrialResults{
        this._logger.Write(` Starting a GA trail #${trialIndex} for ${this.Trials} times`);
        var population: Individual [] = this.CreatesFirstGeneration(original);

        this.bestFit =  this._tester.RetrieveConfiguratedFitFor(original);           

        //Testing the original?        
        
        for (var index = 0; index < this.Trials; index++) {
            this._logger.Write(` Starting time ${this.Trials}`);
            
            
            
            
        }
        
        
        return;
    }
    
    /**
     * Returns a list of Mutated new individuals
     */
    CreatesFirstGeneration(original: Individual): Individual []{
        this._logger.Write(`Initializing a new population [${this.individuals}]`);
        
        var localPopulation: Individual [] = [];
        localPopulation.push(original);
        
        for (var index = 0; index < this.individuals -1; index++) {
            var context: OperatorContext = new OperatorContext();
            var clone: Individual = original.Clone();
            context.First = clone;
            this.Mutate(context)
            this.Test(clone);

            this._logger.Write(`        FIT: ${this._tester.RetrieveConfiguratedFitFor(clone)}`);
            localPopulation.push(clone);
        }
        
        return localPopulation;
    }
    
}