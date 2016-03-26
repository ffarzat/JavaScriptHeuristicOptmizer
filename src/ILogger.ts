import IConfiguration from './IConfiguration';


interface ILogger{
    
    Initialize(configuration: IConfiguration);
    
    Write(message:string);
    
    Finish();
}

export default ILogger;