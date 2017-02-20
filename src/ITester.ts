import IConfiguration from './IConfiguration';
import Individual from './Individual';
import OperatorContext from './OperatorContext';
import TestResults from './TestResults';
import Library from './Library';
import ILogger from './ILogger';


interface ITester{
    
    Setup(testUntil: number, LibrarieOverTest: Library, fitType: string, testTimeout: number, Hosts:Array<string>, memoryLimit: number, clientPath: string);
    
    Test(individual:Individual);
    
    Clone(): ITester;
    
    RetrieveConfiguratedFitFor(individual: Individual): number;
    
    SetLogger(logger: ILogger);

    SetTmeout(ms:number);
}

export default ITester;