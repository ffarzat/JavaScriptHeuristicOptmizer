import IHeuristic from './IHeuristic';
import IConfiguration from '../IConfiguration';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';
import OperatorContext from '../OperatorContext';
import TrialEspecificConfiguration from '../TrialEspecificConfiguration';

/**
 * Random Search for Code Improvement
 */
export default class RD extends IHeuristic {

    trials: number

    /**
     * Especific Setup
     */
    Setup(config: TrialEspecificConfiguration, globalConfig: IConfiguration): void {
        super.Setup(config, globalConfig);

        this.trials = config.trials;
    }

    /**
     * Run the trial
     */
    public async RunTrial(trialIndex: number): Promise<TrialResults> {

        this._logger.Write(`Starting  Random Search`);
        this._logger.Write(`Starting  Trial ${trialIndex} of ${this.Trials}`);

        for (var index = 0; index < this.trials; index++) {

            var ctx: OperatorContext = new OperatorContext();
            ctx.MutationTrials = this.mutationTrials;
            ctx.First = this.bestIndividual;

            var mutant = await this.Mutate(ctx);
            this.UpdateBest(mutant);
        }
        
        var results = this.ProcessResult(trialIndex, this.Original, this.bestIndividual);

        return new Promise<TrialResults>((resolve, reject) => {
            resolve(results);
        });
    }
}