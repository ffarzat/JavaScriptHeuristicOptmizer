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
     * Run a single trial
     */
    RunTrial(trialIndex: number): TrialResults{
        this._logger.Write(`Starting  Trial ${trialIndex} with ${this.generations} generations with ${this.individuals} individuals`);
        
        var population: Individual [] = this.CreatesFirstGeneration(this.Original);

        for (var generationIndex = 1; generationIndex < this.generations; generationIndex++) {
            this._logger.Write(`Starting generation ${generationIndex}`);
            
            for (var individualIndex = 0; individualIndex < this.individuals -1; individualIndex++) {
                
                //Crossover
                var crossoverChance = this.GenereateRandom(0, 100);
                
                if(this.crossoverProbability >= crossoverChance)
                {
                    this._logger.Write(`Doing a crossover with individual ${individualIndex}`);
                    this.DoCrossOver(population, individualIndex);
                }
                
                
                //Mutation
                var mutationChance = this.GenereateRandom(0, 100);

                if(this.mutationProbability >= mutationChance)
                {
                    this._logger.Write(`Doing a mutation with individual ${individualIndex}`);
                    var context: OperatorContext = new OperatorContext();
                    context.First = population[individualIndex];
                    
                    var mutant = this.Mutate(context);
                    this.Test(mutant);
                    population.push(mutant);
                }
            }

            //Looking for a new best            
            population.forEach(element => {
                this.UpdateBest(element);
            });
            
            //Cut off
            this.DoPopuplationCut(population);
        }

        return this.ProcessResult(trialIndex, this.Original, this.bestIndividual);
    }
    
    /**
     * Releases Elitism over population
     */
    private DoPopuplationCut(population: Individual [])
    {
        if(this.elitism){
           var countElitism = (this.individuals * this.elitismPercentual) / 100;
           this._logger.Write(`Using Elitism. Keeping ${countElitism} best individuals`);
           population.sort( (a,b)=> { return this._tester.RetrieveConfiguratedFitFor(a) > this._tester.RetrieveConfiguratedFitFor(b)? 1: 0; });
           population.splice(0, countElitism);
           this.Repopulate(population, countElitism);
        }
        else{
           population.splice(0, this.individuals); 
        }
    }
    
    /**
     * Repopulates using Mutation
     */
    private Repopulate(population: Individual [], untill: number)
    {
           this._logger.Write(`Initializing a new population [+ ${untill} new individuals]`);
            
           for (var localIndex = 0; localIndex < untill; localIndex++) {
               
                var context: OperatorContext = new OperatorContext();
            
                var clone: Individual = this.bestIndividual.Clone();
                
                context.First = clone;
            
                var mutant = this.Mutate(context)

                this.Test(mutant);
                
                //this._logger.Write(`        FIT: ${this._tester.RetrieveConfiguratedFitFor(mutant)}`);

                this.UpdateBest(mutant);

                population.push(mutant);  
           }
    }
    
    
    /**
     * Execute crossover
     */
    private DoCrossOver(population: Individual [], individualIndex: number)
    {
        var context: OperatorContext = new OperatorContext();
        context.First = population[individualIndex];
        context.Second = population[this.GenereateRandom(0, population.length -1)];
        var newOnes = this.CrossOver(context);
        
        this.Test(newOnes[0]);
        population.push(newOnes[0]);
        
        this.Test(newOnes[1]);
        population.push(newOnes[1]);
    }
    
    /**
     * Returns a list of Mutated new individuals
     */
    CreatesFirstGeneration(original: Individual): Individual []{
        var localPopulation: Individual [] = [];
        localPopulation.push(original);
        
       this.Repopulate(localPopulation, this.individuals -1);
        
        return localPopulation;
    }
}