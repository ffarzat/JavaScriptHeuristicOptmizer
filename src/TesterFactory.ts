import CommandTester from './CommandTester';
import ITester from './ITester';

/**
 * TesterFactory
 */
export default class TesterFactory {
    
    /**
     * Creates an instance of especified Heuristic
     */
     CreateByName(name:string): ITester {
        
        switch (name) {            
            case "CommandTester":
                return new CommandTester();
            default:
                throw "Tester not found";
        }
    }
    
}