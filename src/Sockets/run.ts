import Client from './Client';
import Server from './Server';

import IConfiguration from '../IConfiguration';
import LogFactory from '../LogFactory';

import fs = require('fs');
import path = require('path');

var configurationFile: string = path.join(process.cwd(), 'Configuration.json');
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

var localServer = new Server();
localServer.logger = logger;
localServer.Setup(configuration);





