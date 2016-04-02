import IConfiguration from '../IConfiguration';
import IHeuristic from './IHeuristic';
import GA from './GA';
import RD from './RD';

 /**
 * HeuristicFactory
 */
export default class HeuristicFactory {
    
    /**
     * Creates an instance of especified Heuristic
     */
    CreateByName(name:string): IHeuristic {
        
        switch (name) {            
            case "RD":
                return new RD();
            case "GA":
                return new GA();
            default:
                throw "Heuristic not found";
        }
        
    }
}