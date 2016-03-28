import IConfiguration from './IConfiguration';
import Individual from './Individual';

interface ITester{
    Setup(configuration: IConfiguration);
    
    Test(individual:Individual): number;
    
    Clean();
}

export default ITester;