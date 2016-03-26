import IConfiguration from '../IConfiguration';
import IHeuristic from './IHeuristic';
import GA from './GA';

 /**
 * HeuristicFactory
 */
export default class HeuristicFactory {
    
    /**
     * Creates an instance of especified Heuristic
     */
    CreateByName(name:string): IHeuristic {
        return new GA();
    }
}