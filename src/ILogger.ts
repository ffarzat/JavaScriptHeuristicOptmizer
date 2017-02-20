import IConfiguration from './IConfiguration';


interface ILogger{
    
    File(): string;
    
    Category(): string;
    
    Initialize(configuration: IConfiguration);
    
    Write(message:string);
    
    Finish();
}

export default ILogger;