import IConfiguration from './IConfiguration';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import TestResults from './TestResults';
import Library from './Library';


interface ITester{
    
    Setup(testUntil: number, LibrarieOverTest: Library, fitType: string);
    
    Test(individual:Individual);
    
    Clone(): ITester;
    
    RetrieveConfiguratedFitFor(individual: Individual): number;
}

export default ITester;