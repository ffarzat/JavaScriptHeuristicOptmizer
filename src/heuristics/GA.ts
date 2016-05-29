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
        this.Start();
        this._logger.Write(`[GA] Starting  Trial ${trialIndex} with ${this.generations} generations with ${this.individuals} individuals`);

        this.SetLibrary(library, () => {
            this.CreatesFirstGeneration(this.Original, (population) => {
                this.executeStack(1, population, () => {
                    this.Stop();
                    cb(this.ProcessResult(trialIndex, this.Original, this.bestIndividual));
                    return;
                });
            });
        });
    }

    /**
     * Repeat recursively crossover, mutant e cutoff
     */
    private executeStack(generationIndex: number, population: Individual[], cb: () => void) {

        if (generationIndex == (this._config.generations + 1)) {
            cb(); //Done!
        } else {
            this._logger.Write(`[GA] Starting generation ${generationIndex}`);
            this.DoCrossoversAndMutations(population, () => {
                this.DoPopuplationCut(population, () => {
                    generationIndex++
                    this.executeStack(generationIndex, population, cb);
                });
            });
        }
    }


    /**
     * Do crossover and mutation over a population
     */
    private DoCrossoversAndMutations(population: Individual[], cb: () => void) {

        let totalOperations = 0;
        let totalCallback = 0;

        for (var individualIndex = 0; individualIndex < this.individuals - 1; individualIndex++) {

            //Crossover
            var crossoverChance = this.GenereateRandom(0, 100);

            if (this.crossoverProbability >= crossoverChance) {
                this._logger.Write(`[GA] Doing a crossover with individual ${individualIndex}`);
                totalOperations++;

                this.CrossOver(population[individualIndex], population[this.GenereateRandom(0, population.length - 1)], (elements) => {
                    totalCallback++;

                    population.push(elements[0]);
                    population.push(elements[1]);

                    this.UpdateBest(elements[0]);
                    this.UpdateBest(elements[1]);

                    if (totalOperations == totalCallback) {
                        cb();
                    }
                });
            }

            //Mutation
            var mutationChance = this.GenereateRandom(0, 100);

            if (this.mutationProbability >= mutationChance) {
                this._logger.Write(`[GA] Doing a mutation with individual ${individualIndex}`);

                totalOperations++;

                var context: OperatorContext = new OperatorContext();
                context.First = population[individualIndex];

                this.Mutate(context, (mutant) => {
                    totalCallback++;
                    population.push(mutant);
                    this.UpdateBest(mutant);

                    if (totalOperations == totalCallback) {
                        cb();
                    }
                });
            }
        }
    }

    /**
     * Releases Elitism over population
     */
    private DoPopuplationCut(population: Individual[], cb: () => void) {
        for (var index = 0; index < population.length; index++) {
            var element = population[index];
            if (element.testResults == undefined) {
                population.splice(index, 1); //cut off
                this._logger.Write(`[GA] ${index} has no TestResults`);
            }
        }

        if (this.elitism) {
            var countElitism = Math.floor((this.individuals * this.elitismPercentual) / 100);
            this._logger.Write(`[GA] Using Elitism. Cuting off ${countElitism} individuals`);
            population.sort((a, b) => { return a.testResults.fit > b.testResults.fit ? 1 : 0; });
            population.splice(0, countElitism);
            this.Repopulate(population, countElitism, (elements) => {
                cb();
            });
        }
        else {
            population.splice(0, this.individuals);
            if (population.length < this.individuals) {
                this.Repopulate(population, (this.individuals - population.length), (elements) => {
                    cb();
                });
            }
        }
    }

    /**
     * Repopulates using Mutation
     */
    private Repopulate(population: Individual[], untill: number, cb: (individuals: Individual[]) => void) {
        this._logger.Write(`[GA] Initializing a new population [+ ${untill} new individuals]`);
        var total = 0;

        for (var localIndex = 0; localIndex < untill; localIndex++) {
            var context: OperatorContext = new OperatorContext();
            context.First = this.bestIndividual.Clone();
            this.Mutate(context, (mutant) => {
                this.UpdateBest(mutant);
                population.push(mutant);
                total++;
                if (total == untill) {
                    this._logger.Write(`[GA] Repopulate: ${untill} done`);
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