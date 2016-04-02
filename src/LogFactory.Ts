import ConcreteLogger from './ConcreteLogger';
import ILogger from './ILogger';


/**
 * LogFactory
 */
class LogFactory {
    
    /**
     * Creates an instance of especified Heuristic
     */
     CreateByName(name:string): ILogger {
        
        switch (name) {            
            case "ConcreteLogger":
                return new ConcreteLogger();
            default:
                throw "Logger not found";
        }
        
    }
}


export default LogFactory;