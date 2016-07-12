import IConfiguration from './IConfiguration';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import TestResults from './TestResults';
import Library from './Library';
import ILogger from './ILogger';


interface ITester{
    
    Setup(testUntil: number, LibrarieOverTest: Library, fitType: string, cpus: number, hostfile: string, testTimeout: number);
    
    Test(individual:Individual);
    
    Clone(): ITester;
    
    RetrieveConfiguratedFitFor(individual: Individual): number;
    
    SetLogger(logger: ILogger);

    SetTmeout(ms:number);
}

export default ITester;