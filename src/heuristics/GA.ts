import IConfiguration from '../IConfiguration';
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
    public async RunTrial(trialIndex: number): Promise<TrialResults> {
        this._logger.Write(`Starting  Trial ${trialIndex} with ${this.generations} generations with ${this.individuals} individuals`);

        var population: Individual[] = await this.CreatesFirstGeneration(this.Original);

        for (var generationIndex = 1; generationIndex < this.generations; generationIndex++) {
            this._logger.Write(`Starting generation ${generationIndex}`);
            var crossoverPromises = [];
            var mutantPromises = [];
            
            for (var individualIndex = 0; individualIndex < this.individuals - 1; individualIndex++) {
                //Crossover Promises
                var crossoverChance = this.GenereateRandom(0, 100);

                if (this.crossoverProbability >= crossoverChance) {
                    this._logger.Write(`Doing a crossover with individual ${individualIndex}`);
                    crossoverPromises.push(this.DoCrossOver(population, individualIndex));
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

            var newIndividuals: Individual[] = await Promise.all(crossoverPromises);
            this._logger.Write(`newIndividuals: ${newIndividuals.length}`);
            newIndividuals.forEach(element => {
                population.push(element);
            });

            var mutants: Individual[] = await Promise.all(mutantPromises);
            this._logger.Write(`mutants: ${mutants.length}`);
            mutants.forEach(element => {
                population.push(element);
            });

            //Looking for a new best            
            population.forEach(element => {
                this.UpdateBest(element);
            });

            //Cut off
            await this.DoPopuplationCut(population);
        }

        var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);

        return new Promise<TrialResults>((resolve, reject) => {
            resolve(results);
        });
    }

    /**
     * Releases Elitism over population
     */
    private async DoPopuplationCut(population: Individual[]) {
        if (this.elitism) {
            var countElitism = (this.individuals * this.elitismPercentual) / 100;
            this._logger.Write(`Using Elitism. Cuting off ${countElitism} individuals`);
            population.sort((a, b) => { return a.testResults.fit > b.testResults.fit ? 1 : 0; });
            population.splice(0, countElitism);
            await this.Repopulate(population, countElitism);
        }
        else {
            population.splice(0, this.individuals);
        }
    }

    /**
     * Repopulates using Mutation
     */
    private async Repopulate(population: Individual[], untill: number) {
        this._logger.Write(`Initializing a new population [+ ${untill} new individuals]`);

        var promises = [];

        for (var localIndex = 0; localIndex < untill; localIndex++) {

            var context: OperatorContext = new OperatorContext();
            context.First = this.bestIndividual.Clone();
            promises.push(this.Mutate(context));
        }

        var mutants: Individual[] = await Promise.all(promises);
        this._logger.Write(`Repopulate: ${mutants.length} done`);
        //this._logger.Write(`mutants 0 : ${mutants[0].ToCode()}`);
        //this._logger.Write(`Done!`);

        mutants.forEach(element => {
            this.UpdateBest(element);
            population.push(element);
        });
    }


    /**
     * Execute crossover
     */
    public async DoCrossOver(population: Individual[], individualIndex: number): Promise<Individual[]> {
        var context: OperatorContext = new OperatorContext();
        context.First = population[individualIndex];
        context.Second = population[this.GenereateRandom(0, population.length - 1)];
        return this.CrossOver(context);
    }

    /**
     * Returns a list of Mutated new individuals
     */
    async CreatesFirstGeneration(original: Individual): Promise<Individual[]> {
        var localPopulation: Individual[] = [];
        localPopulation.push(original);

        await this.Repopulate(localPopulation, this.individuals - 1);

        return new Promise<Individual[]>((resolve) => { resolve(localPopulation) });
    }
}