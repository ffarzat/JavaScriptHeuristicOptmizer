
import CsvResultsOutWriter from './Results/CsvResultsOutWriter';
import IOutWriter from './IOutWriter';

/**
 * IOutWritterFactory
 */
export default class IOutWriterFactory {
    
    /**
     * Creates an instance of especified IOutWritter
     */
     CreateByName(name:string): IOutWriter {
        
        switch (name) {            
            case "CsvResultsOutWriter":
                return new CsvResultsOutWriter();
            default:
                throw "IOutWritter not found";
        }
        
    }
   
}