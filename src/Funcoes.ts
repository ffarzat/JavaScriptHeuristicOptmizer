/// <reference path="./typings/tsd.d.ts" />
//	node build/src/Funcoes.js 

import TestResults from './TestResults';
import Library from './Library';
import Individual from './Individual';
import ASTExplorer from '../src/ASTExplorer';

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');

var os = require("os");
var exectimer = require('exectimer');
const child_process = require('child_process');
var uuid = require('node-uuid');
var bufferOption = { maxBuffer: 1024 * 5000 }

var newLine: string = '\n';
var csvcontent = "sep=;" + newLine;
csvcontent += "QtdFuncoes;Biblioteca;min;max;media;mediana;duracao" + newLine;

var libs: Library[] = [];

//uuid
var uuidL = new Library();
uuidL.name = "uuid";
uuidL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/uuid"
uuidL.mainFilePath = "/lib/uuid.js"
libs.push(uuidL);

//exectimer
var exectimerL = new Library();
exectimerL.name = "exectimer";
exectimerL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/exectimer"
exectimerL.mainFilePath = "/index.js"
libs.push(exectimerL);

//lodash
var lodashL = new Library();
lodashL.name = "lodash";
lodashL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/lodash"
lodashL.mainFilePath = "/lodash.js"
libs.push(lodashL);

//minimist
var minimistL = new Library();
minimistL.name = "minimist";
minimistL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/minimist"
minimistL.mainFilePath = "/index.js"
libs.push(minimistL);

//moment
//var momentL = new Library();
//momentL.name = "moment";
//momentL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/moment"
//momentL.mainFilePath = "/global.js"
//libs.push(momentL);

//underscore
var underscoreL = new Library();
underscoreL.name = "underscore";
underscoreL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/underscore"
underscoreL.mainFilePath = "/underscore.js"
libs.push(underscoreL);

//xml2js
var xml2jsL = new Library();
xml2jsL.name = "xml2js";
xml2jsL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/xml2js"
xml2jsL.mainFilePath = "/lib/xml2js.js"
libs.push(xml2jsL);

//express-ifttt-webhook
var expressL = new Library();
expressL.name = "express-ifttt-webhook";
expressL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/express-ifttt-webhook"
expressL.mainFilePath = "/index.js"
libs.push(expressL);

//gulp-ccr-browserify
var gulpL = new Library();
gulpL.name = "gulp-ccr-browserify";
gulpL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/gulp-ccr-browserify"
gulpL.mainFilePath = "/index.js"
libs.push(gulpL);

//bower
var bowerL = new Library();
bowerL.name = "bower";
bowerL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/bower"
bowerL.mainFilePath = "/lib/index.js"
libs.push(bowerL);

//plivo-node
var plivoL = new Library();
plivoL.name = "plivo-node";
plivoL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/plivo-node"
plivoL.mainFilePath = "/lib/plivo.js"
libs.push(plivoL);

//node-browserify
var browserifyL = new Library();
browserifyL.name = "bower";
browserifyL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/node-browserify"
browserifyL.mainFilePath = "/index.js"
libs.push(browserifyL);

//tleaf
var tleafL = new Library();
tleafL.name = "tleaf";
tleafL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/tleaf"
tleafL.mainFilePath = "/index.js"
libs.push(tleafL);

//pug
var pugL = new Library();
pugL.name = "pug";
pugL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/pug"
pugL.mainFilePath = "/packages/pug/lib/index.js"
libs.push(pugL);

//jquery
var jqueryL = new Library();
jqueryL.name = "jquery";
jqueryL.path = "/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/jquery"
jqueryL.mainFilePath = "/dist/jquery.js"
libs.push(jqueryL);



libs.forEach(element => {
    console.log(`Processando ${element.name}`)

    var DiretorioBiblioteca = element.path;
    var arquivoRootBiblioteca = element.mainFilePath;
    var Quantidade = 5
    var resultadosProcessados = [];


    console.log(`${DiretorioBiblioteca}`);
    console.log(`${arquivoRootBiblioteca}`);
    console.log(`Executar os testes ${Quantidade} vezes`);

    arquivoRootBiblioteca = path.join(DiretorioBiblioteca, arquivoRootBiblioteca);

    var astExplorer: ASTExplorer = new ASTExplorer();

    var generatedIndividual: Individual = astExplorer.GenerateFromFile(arquivoRootBiblioteca);



    var caminhoOriginal = DiretorioBiblioteca + arquivoRootBiblioteca;
    //var codigoOriginal = fs.readFileSync(caminhoOriginal, 'UTF8');
    //WriteCodeToFile(arquivoRootBiblioteca, codigoOriginal);

    //Despreza a primeira execuçao
    ExecutarTeste(DiretorioBiblioteca, bufferOption, 1, "0", "original")
    var resultadoOriginal = ExecutarTeste(DiretorioBiblioteca, bufferOption, Quantidade, "0", "original");
    resultadoOriginal.Heuristic = element.name
    //Funções
    var funcoes = getFunctionStaticList(generatedIndividual);
    resultadoOriginal.Trial = funcoes.length;
    
    resultadosProcessados.push(resultadoOriginal);

    console.log(`Escrever csv com ${resultadosProcessados.length} resultados obtidos`);
    EscreverResultadoEmCsv(process.cwd(), resultadosProcessados);
});

process.exit();



/**
 * Salva o código por cima do da Lib atual
 */
function WriteCodeToFile(caminho: string, codigo: string) {
    fs.writeFileSync(caminho, codigo);
}

/**
 * Executa os testes e recupera os valores
 */
function ExecutarTeste(DiretorioBiblioteca: string, bufferOption: any, quantidade: number, trial: string, heuristica: string): TestResults {
    var msgId = uuid.v4();
    var passedAllTests = true;

    var testCMD = `node --expose-gc --max-old-space-size=512000  src/client.js 0 ${DiretorioBiblioteca} ${120000}`; //timeout bem grande

    if (os.hostname() != "Optmus") {
        //child_process.execSync("sleep 1", bufferOption).toString();
    }

    var stdout = "";

    for (var index = 0; index < quantidade; index++) {

        try {
            var Tick = new exectimer.Tick(msgId);
            Tick.start();
            console.log(`   ${index}x`);

            stdout = child_process.execSync(testCMD, bufferOption).toString();
            Tick.stop();

            var stringList = stdout.replace(/(?:\r\n|\r|\n)/g, ',');;
            stringList = stringList.substring(0, stringList.length - 1);
            //console.log(`${stringList}`);
            var resultadoJson = JSON.parse(`${stringList}`);

            if (resultadoJson.sucess == "false") {
                passedAllTests = false;
                break;
            }
        } catch (error) {
            console.log(`stdout: ${stdout}`);
            console.log(`${error.stack}`);

            Tick.stop();
            passedAllTests = false;
            break;
        }

    }

    var unitTestsTimer = exectimer.timers[msgId];
    var resultadoFinal: TestResults = new TestResults();

    resultadoFinal.rounds = quantidade;
    resultadoFinal.min = ToNanosecondsToSeconds(unitTestsTimer.min());
    resultadoFinal.max = ToNanosecondsToSeconds(unitTestsTimer.max());
    resultadoFinal.mean = ToNanosecondsToSeconds(unitTestsTimer.mean());
    resultadoFinal.median = ToNanosecondsToSeconds(unitTestsTimer.median());
    resultadoFinal.duration = ToNanosecondsToSeconds(unitTestsTimer.duration());
    resultadoFinal.passedAllTests = passedAllTests

    resultadoFinal.Trial = trial;

    //ShowConsoleResults(resultadoFinal);

    return resultadoFinal;

}

/**
 * Transform nano secs in secs
 */
function ToNanosecondsToSeconds(nanovalue: number): number {
    return parseFloat((nanovalue / 1000000000.0).toFixed(3));
}

function ShowConsoleResults(result: TestResults) {
    console.log('Results:');
    console.log('total duration:' + result.duration); // total duration of all ticks
    console.log('min:' + result.min);      // minimal tick duration
    console.log('max:' + result.max);      // maximal tick duration
    console.log('mean:' + result.mean);     // mean tick duration
    console.log('median:' + result.median);   // median tick duration
}

/**
 * Salva os resultados na raiz
 */
function EscreverResultadoEmCsv(DiretorioResultados: string, listaResultados: TestResults[]) {

    listaResultados.forEach(element => {
        if (element.passedAllTests)
            csvcontent += `${element.Trial};${element.Heuristic};${element.min};${element.max};${element.median};${element.mean};${element.duration}` + newLine;
    });

    fs.writeFileSync(path.join(DiretorioResultados, `Tempo.csv`), csvcontent);
}

function parseMillisecondsIntoReadableTime(milliseconds) {
    //Get hours from milliseconds
    var hours = milliseconds / (1000 * 60 * 60);
    var absoluteHours = Math.floor(hours);
    var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

    //Get remainder from hours and convert to minutes
    var minutes = (hours - absoluteHours) * 60;
    var absoluteMinutes = Math.floor(minutes);
    var m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;

    //Get remainder from minutes and convert to seconds
    var seconds = (minutes - absoluteMinutes) * 60;
    var absoluteSeconds = Math.floor(seconds);
    var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;

    return h + ':' + m + ':' + s;
}

/**
    * Ranking estático de funções mais utilizadas no código
    */
function getFunctionStaticList(Original: Individual): any {
    var caminho = __dirname.replace('build', '');
    var functionExtractor = require(caminho + '/heuristics/function-extractor.js');
    var functions = functionExtractor.interpret(Original.AST);

    console.log(`Funções: ${functions.length}`);

    return functions;
}