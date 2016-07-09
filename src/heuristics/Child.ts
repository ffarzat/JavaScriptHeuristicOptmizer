
//Child fork test
import Message from '../Sockets/Message';
import Client from '../Sockets/Client';
import OperatorContext from '../OperatorContext';
import IConfiguration from '../IConfiguration';
import LogFactory from '../LogFactory';

import fs = require('fs');
import path = require('path');
import Shell = require('shelljs');

var uuid = require('node-uuid');
var tmp = require('temporary');
var fse = require('fs-extra');
var rmdir = require('rmdir');
var clientWorkDir = new tmp.Dir();
//=========================================================================================== Read Configuration values
var configFile = process.argv[2] != undefined ? process.argv[2] : 'Configuration.json';
var configurationFile: string = path.join(process.cwd(), configFile);
var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));

var testOldDirectory: string = process.cwd();

//========================================================================================== Logger
var logger = new LogFactory().CreateByName(configuration.logWritter);
logger.Initialize(configuration);

//Patch for execution over NACAD PBS 
if (process.platform !== "win32") {
    process.env['TMPDIR'] = configuration.tmpDirectory;
}

//========================================================================================== Client initialization
var clientId = uuid.v4();
var serverUrl = configuration.url + ':' + configuration.port + "/ID=" + clientId;

var localClient = new Client();
localClient.id = clientId;
localClient.logger = logger;

localClient.Setup(configuration, clientWorkDir);

ParseConfigAndLibs(clientWorkDir.path);

logger.Write(`[Client:${clientId}] ready`);

//========================================================================================== fork-poll handling
process.on('message', function (message) {

    //try {
        var msg: Message = JSON.parse(message);
        msg.ctx = localClient.Reload(msg.ctx);
        //logger.Write(`[runClient]Client ${localClient.id} processing message ${msg.id}`);
        

        if (msg.ctx.Operation == "Mutation") {
            logger.Write(`[runClient]processing ${msg.ActualLibrary} new mutant`);
            msg.ctx =localClient.Mutate(msg.ctx);
        }

        if (msg.ctx.Operation == "MutationByIndex") {
            logger.Write(`[runClient]processing ${msg.ActualLibrary} new mutant by node index`);
            msg.ctx =localClient.MutateBy(msg.ctx);
        }

        if (msg.ctx.Operation == "CrossOver") {
            logger.Write(`[runClient]processing ${msg.ActualLibrary} new crossover`);
            msg.ctx =localClient.CrossOver(msg.ctx);
        }

        if (msg.ctx.Operation == "Test") {
            logger.Write(`[runClient]processing ${msg.ActualLibrary} tests`);
            msg.ctx =localClient.Test(msg.ctx);
        }

        var msgProcessada = JSON.stringify(msg);
        logger.Write(`[runClients] Msg ${msg.id} done.`);
        process.send(msg);
        //process.send(msgProcessada);
    //}
    //catch (err) {
        //logger.Write(`[runClient]Client error: ${err}`);
        //process.exit(111111);
    //}
});


/**
 * Copia e instala, se for o caso, a lib localmente
 */
function ParseConfigAndLibs(workDir: string) {
    for (var libIndex = 0; libIndex < configuration.libraries.length; libIndex++) {
        var element = configuration.libraries[libIndex];
        var libDirectoryPath = path.join(process.cwd(), element.path);
        var libNodeModules = path.join(libDirectoryPath, "node_modules");
        var tempLibPath = path.join(workDir, element.name);
        try {
            if (!fs.existsSync(libNodeModules)) {
                process.chdir(libDirectoryPath);
                var returnedOutput: Shell.ExecOutputReturnValue = (Shell.exec(`npm install`, { silent: true }) as Shell.ExecOutputReturnValue);

                if (returnedOutput.code > 0) {
                    logger.Write(`[runClient] Library ${element.name} has error to execute npm install. It will be out of improvement process.`);
                    configuration.libraries.splice(libIndex, 1);
                }
                else {
                    logger.Write(`[runClient] Library ${element.name} instaled successfully`);
                }
            }

            if (!fs.existsSync(tempLibPath)) {
                //logger.Write(`[runClient] Copying ${element.name} to ${tempLibPath}`);
                logger.Write(`[runClient] Copying ${element.name}`);
                fs.mkdirSync(tempLibPath);
                fse.copySync(libDirectoryPath, tempLibPath, { "clobber": true, "filter": function () { return true; } });
                //in order to test

                element.mainFilePath = path.join(tempLibPath, JSON.parse(fs.readFileSync(path.join(tempLibPath, "package.json")).toString()).main); //new main file path
                element.path = tempLibPath;
                //logger.Write(`  Updating element.mainFilePath : ${element.mainFilePath}`);
                //logger.Write(`  Updating  element.path ${element.path}`);
            }

        } catch (error) {
            logger.Write(`-->${error}`);
        }
        finally {
            process.chdir(testOldDirectory);
        }
    }
}



