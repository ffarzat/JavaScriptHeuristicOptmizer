import IConfiguration from './IConfiguration';
import Individual from './Individual';
import OperatorContext from './OperatorContext';


interface ITester{
    
    Setup(configuration: IConfiguration, context: OperatorContext);
    
    Test(individual:Individual): number;
    
    Clean();
}

export default ITester;