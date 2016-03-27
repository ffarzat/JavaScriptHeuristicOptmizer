import npm = require('npm');
import ITester from './ITester';
import IConfiguration from './IConfiguration';
import Individual from './Individual';


 /**
 * NPMTester - executes tests for especific library
 */
export default class NPMTester implements ITester {
    
    config: IConfiguration;
    
    
    /**
     * Initializes NPM packages if necessary
     */
    Setup(configuration: IConfiguration){
        //do nothing in this case
        
        this.config = configuration;
    }
    
    Test(individual:Individual){
        
        //Save new code on 
        
        
    }
    
    /**
     * Backs to initial state
     */
    Clean(){
        
    }
   
}