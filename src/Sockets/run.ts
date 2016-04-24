import Client from './Client';
import Server from './Server';

import IConfiguration from '../IConfiguration';
import LogFactory from '../LogFactory';
import ASTExplorer from '../ASTExplorer';
import OperatorContext from '../OperatorContext';
import Individual from '../Individual';

import fs = require('fs');
import path = require('path');

var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

var astExplorer:ASTExplorer = new ASTExplorer();
var context: OperatorContext = new OperatorContext();

var lib = configuration.libraries[1]; 
var libFile :string  = lib.mainFilePath;
var generatedIndividual: Individual = astExplorer.GenerateFromFile(libFile);

 var indexes = astExplorer.IndexNodes(generatedIndividual);

var context: OperatorContext = new OperatorContext();
context.First = generatedIndividual;
context.NodeIndex = indexes[1];
context.MutationTrials = configuration.mutationTrials;


var localServer = new Server();
localServer.logger = logger;
localServer.Setup(configuration);

setInterval(function() { localServer.DoAMutation(context); }, 1000);




