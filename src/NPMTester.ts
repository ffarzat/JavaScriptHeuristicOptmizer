import npm = require('npm');   
import ITester from './ITester';
import IConfiguration from './IConfiguration';
import Individual from './Individual';

var exectimer = require('exectimer');

 /**
 * NPMTester - executes tests for especific library
 */
export default class NPMTester implements ITester {
    
    config: IConfiguration;
    
    testUntil: number;
    
   
    /**
     * Initializes NPM packages if necessary
     */
    Setup(configuration: IConfiguration){
        
        this.config = configuration;
        
        this.testUntil = configuration.testUntil;
        
    }
        
    Test(individual:Individual) :number{
        
        var tick = new exectimer.Tick("testFunction");
        
        var functionCallBackTest = function (er, data1, data2, data3, data4) {
            if (er) {
                console.log('       Falha na execução dos testes');
                console.log(er);
            }
        };
        
        var testFunctions = [];
        
        for (var index = 0; index < this.testUntil; index++) {
            var functionNPM = npm.commands.test.bind(npm.commands, [], functionCallBackTest );
            testFunctions.push(functionNPM);
        }
        
        var functionExecuteTests = function () {
            var testFunction = testFunctions.pop();
            
            if(!testFunction)
                return;
  
  
            npm.load({}, function(err){
                tick.start();
                testFunction();
                tick.stop();
            });
            
            functionExecuteTests();
        }
        
        functionExecuteTests();
        
        var testFunction_timer = exectimer.timers.testFunction;
        
        var fit = testFunction_timer.parse(testFunction_timer.duration());
        
        console.log(`       Fitness: ${fit}`);  
        
        //Save new code on 
        return fit;
        
    }
    
    /**
     * Backs to initial state
     */
    Clean(){
        
    }
   
}