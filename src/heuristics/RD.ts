import IHeuristic from './IHeuristic';
import IConfiguration from '../IConfiguration';
import ITester from '../ITester';
import TrialResults from '../Results/TrialResults';
import Individual from '../Individual';

/**
 * Random Search for Code Improvement
 */
export default class RD extends IHeuristic {
    
    /**
     * Run the trial
     */
    RunTrial(trialIndex: number): TrialResults{
        this._logger.Write(`Starting  Random Search`);
        this._logger.Write(`Starting  Trial ${trialIndex} of ${this.Trials}`);
        
        for (var index = 0; index < this.Trials; index++) {

        }
        
        
        var fakeResult = new TrialResults();
    
        fakeResult.trial = 1;
        fakeResult.bestIndividualAvgTime = 1.69;
        fakeResult.bestIndividualCharacters = 15968;
        fakeResult.bestIndividualLOC = 68000;
        
        fakeResult.originalIndividualAvgTime = 2.1;
        fakeResult.originalIndividualCharacters = 16000
        fakeResult.originalIndividualLOC = 70000;
        fakeResult.best = new Individual();
        
        
        return fakeResult;
    }
    
}