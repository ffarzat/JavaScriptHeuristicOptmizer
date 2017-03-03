/// <reference path="../src/typings/tsd.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import expect = require('expect.js');

import IConfiguration from '../src/IConfiguration';
import CommandTester from '../src/CommandTester';
import Individual from '../src/Individual';
import OperatorContext from '../src/OperatorContext';
import ASTExplorer from '../src/ASTExplorer';
import LogFactory from '../src/LogFactory';

describe('CommandTester Tests', function () {

    this.timeout(60 * 10 * 1000); //10 minutes

    it('Should execute Tests from uuid Lib', () => {

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[1];

        //Creates the Inidividual for tests
        var astExplorer: ASTExplorer = new ASTExplorer();
        var individualOverTests: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);


        var logger = new LogFactory().CreateByName(configuration.logWritter);
        logger.Initialize(configuration);


        //Setup
        var commandTester = new CommandTester();
        commandTester.Setup(configuration.testUntil, lib, configuration.fitType, configuration.clientTimeout * 1000, undefined, 2047, undefined);
        commandTester.SetLogger(logger);

        //Exec the test
        commandTester.Test(individualOverTests);
        //logger.Write(individualOverTests.testResults.outputs.toString());

        expect(individualOverTests.testResults.passedAllTests).to.be(true);
        expect(individualOverTests.testResults).not.to.be(undefined);
        expect(individualOverTests.testResults.duration).not.to.be(undefined);
        expect(individualOverTests.testResults.min).not.to.be(undefined);
        expect(individualOverTests.testResults.max).not.to.be(undefined);
        expect(individualOverTests.testResults.mean).not.to.be(undefined);
        expect(individualOverTests.testResults.median).not.to.be(undefined);
        expect(individualOverTests.testResults.outputs).not.to.be(undefined);
        expect(individualOverTests.testResults.passedAllTests).not.to.be(undefined);
        expect(individualOverTests.testResults.rounds).not.to.be(undefined);
    });


    it('Should making dynamic ranking of functions', () => {

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[5]; //Libraries/pug

        //Creates the Inidividual for tests
        var astExplorer: ASTExplorer = new ASTExplorer();
        var individualOverTests: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);

        var libraryPath = `Libraries/${lib.name}`;

        var caminho = __dirname.replace('build', '');
        var esmorph = require(caminho + '/../src/esmorph-new.js');

        var modifiers;
        modifiers = [];
        modifiers.push(esmorph.Tracer.FunctionEntrance('Enter'));
        //modifiers.push(esmorph.Tracer.FunctionExit('Exit'));

        //{ name: 'test', lineNumber: 1, range: [11, 49] }
        var morphed = esmorph.modify(individualOverTests.ToCode(), modifiers);
        morphed += `\n\n 
        var optmizerFunctionsInternalList = {};

        function Enter(details){
            //console.log(details.name + ' + 1!');
            
            if(optmizerFunctionsInternalList === undefined)
            {
                optmizerFunctionsInternalList = {};
            }

            if(optmizerFunctionsInternalList[details.name] == undefined){
                optmizerFunctionsInternalList[details.name] = parseInt(0);
            }
            
            optmizerFunctionsInternalList[details.name] = isNaN(optmizerFunctionsInternalList[details.name])? 0 : parseInt(optmizerFunctionsInternalList[details.name]) + parseInt(1);
            //save Json file
            
            var fs = require("fs");
            fs.writeFileSync('${lib.name}-resultados-dinamico.json', JSON.stringify(optmizerFunctionsInternalList, null, 4));
        };`

        //console.log(morphed);

        //Copia de segurança 

        var oldLibFilePath = path.join(libraryPath, 'old.js');
        if (!fse.existsSync(oldLibFilePath))
            fse.copySync(lib.mainFilePath, oldLibFilePath, { "clobber": true });

        //Salva o código modificado
        fs.writeFileSync(lib.mainFilePath, morphed);

        //executa os testes
        const execSync = require('child_process').execSync;
        var output = execSync(`cd '${libraryPath}' && npm test`);
        //console.log(output);

        //recupera o arquivo json com os dados computados

        //volta ao arquivo original
        fse.copySync(oldLibFilePath, lib.mainFilePath, { "clobber": true });
    });



    it('Should making dynamic timming list of functions', () => {

        var configurationFile: string = path.join(process.cwd(), 'test', 'Configuration.json');
        var configuration: IConfiguration = JSON.parse(fs.readFileSync(configurationFile, 'utf8'));
        var lib = configuration.libraries[5]; //Libraries/uuid

        //Creates the Inidividual for tests
        var astExplorer: ASTExplorer = new ASTExplorer();
        var individualOverTests: Individual = astExplorer.GenerateFromFile(lib.mainFilePath);

        var libraryPath = `Libraries/${lib.name}`;

        var caminho = __dirname.replace('build', '');
        var esmorph = require(caminho + '/../src/esmorph-new.js');

        var modifiers;
        modifiers = [];
        modifiers.push(esmorph.Tracer.FunctionEntrance('Enter'));
        modifiers.push(esmorph.Tracer.FunctionExit('Exit'));

        var globalName = `__${lib.name}_time`;

        var resultFile = `${lib.name}-resultados-time.json`;

        //{ name: 'test', lineNumber: 1, range: [11, 49] }
        var morphed = esmorph.modify(individualOverTests.ToCode(), modifiers);
        morphed += `\n\n 
        
        

        function Enter(details){

            if(details.name == "toString")
                return;

            if(global['${globalName}'] == undefined)
                global['${globalName}'] = {};

            if(global.t == undefined)    
                global.t = require('exectimer');
            
            global[details.name] = new global.t.Tick(details.name);

            if(global[details.name])
                global[details.name].start();
        }

        function Exit(details){
            
            if(details.name == "toString")
                return;

            if(global[details.name] != undefined)
                global[details.name].stop();

            if(global['${globalName}'] != undefined && global[details.name] != undefined)
            {
                global['${globalName}'][details.name] = ToNanosecondsToSeconds(global.t.timers[details.name].duration());
                var fs = require("fs");
                fs.writeFileSync('${resultFile}', JSON.stringify(global['${globalName}'], null, 4));
            }
        };
        
        function ToNanosecondsToSeconds(nanovalue) {
            return parseFloat((nanovalue / 1000000000.0).toFixed(3));
        }
        
        `

        //console.log(morphed);

        //Copia de segurança 

        var oldLibFilePath = path.join(libraryPath, 'old.js');
        if (!fse.existsSync(oldLibFilePath))
            fse.copySync(lib.mainFilePath, oldLibFilePath, { "clobber": true });

        //Salva o código modificado
        fs.writeFileSync(lib.mainFilePath, morphed);

        //executa os testes
        const t = require('exectimer');
        const Tick = t.Tick;
        var tick = new Tick("testes");
        tick.start();

        const execSync = require('child_process').execSync;
        var output = execSync(`cd '${libraryPath}' && npm test`);
        tick.stop();
        var results = t.timers.testes;
        
        try {
            //recupera o arquivo json com os dados computados e adiciona o tempo total
            var objeto = JSON.parse(fse.readFileSync(`${libraryPath}/${resultFile}`).toString());
            objeto['total'] = ToNanosecondsToSeconds(results.duration());
            fse.writeFileSync(`${libraryPath}/${resultFile}`, JSON.stringify(objeto, null, 4));
        } catch (error) {
            console.log(error);
        }


        //volta ao arquivo original
        fse.copySync(oldLibFilePath, lib.mainFilePath, { "clobber": true });
    });


});


/** Calculo to tempo em ms */
function clock(startTime): any {
    if (!startTime) return process.hrtime();
    var end = process.hrtime(startTime);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
}

function ToNanosecondsToSeconds(nanovalue): any {
    return parseFloat((nanovalue / 1000000000.0).toFixed(3));
}