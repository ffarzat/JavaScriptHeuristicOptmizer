import IConfiguration from '../IConfiguration';
import TrialEspecificConfiguration from '../TrialEspecificConfiguration';
import IHeuristic from './IHeuristic';

import Individual from '../Individual';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import OperatorContext from '../OperatorContext';
import ILogger from '../ILogger';
import Library from '../Library';

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
    population: Individual[];


    /**
    * Especific Setup
    */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration): void {

        super.Setup(config, globalConfig);

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
    RunTrial(trialIndex: number, library: Library, cb: (results: TrialResults) => void) {
        this._logger.Write(`Starting  Trial ${trialIndex} with ${this.generations} generations with ${this.individuals} individuals`);

        this.SetLibrary(library, () => {
            this.CreatesFirstGeneration(this.Original, (population) => {
                this._logger.Write(`CreatesFirstGeneration concluded`);
            });

            //Operacoes

            //Avaliacoes
            //PopulationCut
            //Results
        });

        /*
        var population: Individual[] = this.CreatesFirstGeneration(this.Original);
        for (var generationIndex = 1; generationIndex < this.generations; generationIndex++) {
            this._logger.Write(`Starting generation ${generationIndex}`);
            var crossoverPromises = [];
            var mutantPromises = [];
            
            for (var individualIndex = 0; individualIndex < this.individuals - 1; individualIndex++) {
                //Crossover Promises
                var crossoverChance = this.GenereateRandom(0, 100);

                if (this.crossoverProbability >= crossoverChance) {
                    this._logger.Write(`Doing a crossover with individual ${individualIndex}`);
                    crossoverPromises.push(this.CrossOver(population[individualIndex], population[this.GenereateRandom(0, population.length - 1)]));
                }

                //Mutation Promises
                var mutationChance = this.GenereateRandom(0, 100);

                if (this.mutationProbability >= mutationChance) {
                    this._logger.Write(`Doing a mutation with individual ${individualIndex}`);
                    var context: OperatorContext = new OperatorContext();
                    context.First = population[individualIndex];

                    mutantPromises.push(this.Mutate(context));
                }
            }

            var newIndividuals: Individual[][] = await Promise.all(crossoverPromises);
            this._logger.Write(`newIndividuals: ${newIndividuals.length}`);
            newIndividuals.forEach(element => {
                population.push(element[0]);
                population.push(element[1]);
            });

            var mutants: Individual[] = await Promise.all(mutantPromises);
            this._logger.Write(`mutants: ${mutants.length}`);
            mutants.forEach(element => {
                population.push(element);
            });

            //Looking for a new best            
            population.forEach(element => {
                
                //this._logger.Write(`         [IHeuristic.GA.UpdateBest]Element has Testresults: ${element.testResults}`);
                this.UpdateBest(element);
            });

            //Cut off
            await this.DoPopuplationCut(population);
        }
        */
        //var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);
        //cb(results);
    }

    /**
     * Releases Elitism over population
     */
    private async DoPopuplationCut(population: Individual[]) {

        /*
        //Bug: some individuals has no TestResult (undefined value)

        for (var index = 0; index < population.length; index++) {
            var element = population[index];
            if (element.testResults == undefined) {
                population.splice(index, 1); //cut off
                this._logger.Write(`${index} has no TestResults`);
            }
        }

        if (this.elitism) {
            var countElitism = (this.individuals * this.elitismPercentual) / 100;
            this._logger.Write(`Using Elitism. Cuting off ${countElitism} individuals`);
            population.sort((a, b) => { return a.testResults.fit > b.testResults.fit ? 1 : 0; });
            population.splice(0, countElitism);
            await this.Repopulate(population, countElitism);
        }
        else {
            population.splice(0, this.individuals);
            if (population.length < this.individuals) {
                await this.Repopulate(population, (this.individuals - population.length));
            }
        }
        
        */
    }

    /**
     * Repopulates using Mutation
     */
    private Repopulate(population: Individual[], untill: number, cb: (individuals: Individual[]) => void) {
        this._logger.Write(`Initializing a new population [+ ${untill} new individuals]`);
        var total = 0;

        for (var localIndex = 0; localIndex < untill; localIndex++) {
            var context: OperatorContext = new OperatorContext();
            context.First = this.bestIndividual.Clone();
            this.Mutate(context, (mutant) => {
                this.UpdateBest(mutant);
                population.push(mutant);
                total++;
                if (total == untill) {
                    this._logger.Write(`Repopulate: ${untill} done`);
                    cb(population);
                }
            });
        }
    }

    /**
     * Returns a list of Mutated new individuals
     */
    CreatesFirstGeneration(original: Individual, cb: (individuals: Individual[]) => void) {
        var localPopulation: Individual[] = [];
        this.Repopulate(localPopulation, this.individuals - 1, (newIndividuals: Individual[]) => {
            newIndividuals.unshift(original);
            cb(newIndividuals);
        });
    }
}