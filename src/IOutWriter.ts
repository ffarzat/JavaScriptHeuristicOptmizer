import IConfiguration from './IConfiguration';
import Individual from './Individual';
import TestResults from './TestResults';
import TrialResults from './Results/TrialResults';
import Library from './Library';
import IHeuristic from './heuristics/IHeuristic';

/**
 * Responsible for manager results storage
 * 
 */
interface IOutWritter
{
    Initialize(configuration: IConfiguration, library: Library, heuristic: IHeuristic);
    
    WriteTrialResults(result: TrialResults);
    
    Finish();    
}


export default IOutWritter;