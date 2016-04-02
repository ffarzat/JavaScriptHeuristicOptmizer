import IConfiguration from './IConfiguration';
import Individual from './Individual';
import TestResults from './TestResults';
import TrialResults from './Results/TrialResults';

/**
 * Responsible for manager results storage
 * 
 */
interface IOutWritter
{
    Initialize(configuration: IConfiguration);
    
    WriteTrialResults(result: TrialResults);
    
    Finish();
}


export default IOutWritter;