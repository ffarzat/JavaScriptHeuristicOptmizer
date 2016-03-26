import IConfiguration from './IConfiguration';

interface ITester{
    Setup(configuration: IConfiguration);
    
    Test();
    
    Clean();
}

export default ITester;