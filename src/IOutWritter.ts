import IConfiguration from './IConfiguration';

interface IOutWritter
{
    Initialize(configuration: IConfiguration);
    
    Write(message:string);
    
    Finish();
}


export default IOutWritter;