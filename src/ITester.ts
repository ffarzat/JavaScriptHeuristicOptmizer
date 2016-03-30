import IConfiguration from './IConfiguration';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import TestResults from './TestResults';


interface ITester{
    
    Setup(configuration: IConfiguration, context: OperatorContext);
    
    Test(individual:Individual): TestResults;
    
    Clean();
}

export default ITester;