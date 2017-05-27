import IConfiguration from '../IConfiguration';
import IHeuristic from './IHeuristic';
import GA from './GA';
import RD from './RD';
import HC from './HC';
import LS from './LS';

/**
* HeuristicFactory
*/
export default class HeuristicFactory {

    /**
     * Creates an instance of especified Heuristic
     */
    CreateByName(name: string): IHeuristic {

        switch (name) {
            case "HC":
                return new HC();
            case "RD":
                return new RD();
            case "GA":
                return new GA();
            case "LS":
                return new LS();
            default:
                throw "Heuristic not found";
        }

    }
}