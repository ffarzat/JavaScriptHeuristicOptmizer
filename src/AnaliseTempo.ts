/// <reference path="./typings/tsd.d.ts" />
//node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/uuid' 'uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Estatica/uuid' 30 5

import TestResults from './TestResults';


import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');


var exectimer = require('exectimer');
const child_process = require('child_process');
var uuid = require('node-uuid');
var bufferOption = { maxBuffer: 1024 * 5000 }

//var heuristicas = ['RD', 'HC', 'GA'];
var heuristicas = ['HC', 'RD'];
var DiretorioBiblioteca = process.argv[2].replace("'", "");
var arquivoRootBiblioteca = process.argv[3].replace("'", "");
var DiretorioResultados = process.argv[4].replace("'", "");
var QuantidadeRodadas = parseInt(process.argv[5]);
var Quantidade = parseInt(process.argv[6]);
var resultadosProcessados = [];
var os = require("os");

arquivoRootBiblioteca = path.join(DiretorioBiblioteca, arquivoRootBiblioteca);

console.log(`${DiretorioBiblioteca}`);
console.log(`${arquivoRootBiblioteca}`);
console.log(`${DiretorioResultados}`);
console.log(`Verificar as ${QuantidadeRodadas} rodadas existentes`);
console.log(`Executar os testes ${Quantidade} vezes`);


//Copia de segurança
var oldLibFilePath = path.join(DiretorioBiblioteca, 'old.js');
if (!fs.existsSync(oldLibFilePath))
    fse.copySync(arquivoRootBiblioteca, oldLibFilePath, { "clobber": true });


//============================================================================================ Original //>

var caminhoOriginal = DiretorioResultados + `/${heuristicas[0]}/original.js`;
var codigoOriginal = fs.readFileSync(caminhoOriginal, 'UTF8');
WriteCodeToFile(arquivoRootBiblioteca, codigoOriginal);

//Despreza a primeira execuçao
ExecutarTeste(DiretorioBiblioteca, bufferOption, 1, "0", "original")
var resultadoOriginal = ExecutarTeste(DiretorioBiblioteca, bufferOption, Quantidade, "0", "original");
resultadosProcessados.push(resultadoOriginal);

//============================================================================================ Rodadas //>

heuristicas.forEach(heuristica => {
    for (var index = 0; index < QuantidadeRodadas; index++) {
        console.log(`Executando rodada ${index} da heuristica ${heuristica}`);

        var caminhoArquivoRodada = DiretorioResultados + "/" + heuristica + "/" + index + ".js";
        var CodigoDaRodada = fs.readFileSync(caminhoArquivoRodada, 'UTF8');

        if (CodigoDaRodada != codigoOriginal) {

            WriteCodeToFile(arquivoRootBiblioteca, CodigoDaRodada);

            resultadosProcessados.push(ExecutarTeste(DiretorioBiblioteca, bufferOption, Quantidade, `${index}`, heuristica));
        }
        else {
            console.log(`   O código é igual ao original`);
            var resultadoFinal: TestResults = new TestResults();

            resultadoFinal.rounds = Quantidade;
            resultadoFinal.min = resultadoOriginal.min;
            resultadoFinal.max = resultadoOriginal.max;
            resultadoFinal.mean = resultadoOriginal.mean;
            resultadoFinal.median = resultadoOriginal.median;
            resultadoFinal.duration = resultadoOriginal.duration;
            resultadoFinal.passedAllTests = true;

            resultadoFinal.Trial = "0";

            resultadosProcessados.push();
        }
    }
});

//============================================================================================ Fim //>
//Volta a cópia de segurança
fse.copySync(oldLibFilePath, arquivoRootBiblioteca, { "clobber": true });

console.log(`Escrever csv com ${resultadosProcessados.length} resultados obtidos`);

EscreverResultadoEmCsv(DiretorioResultados, resultadosProcessados);

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
        child_process.execSync("sleep 1", bufferOption).toString();
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
    resultadoFinal.Heuristic = heuristica;

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

    var newLine: string = '\n';
    var csvcontent = "sep=;" + newLine;
    csvcontent += "Rodada;Algoritmo;min;max;media;mediana;duracao" + newLine;

    listaResultados.forEach(element => {
        if (element.passedAllTests)
            csvcontent += `${element.Trial};${element.Heuristic};${element.min};${element.max};${element.median};${element.mean};${element.duration}` + newLine;
    });

    fs.writeFileSync(path.join(DiretorioResultados, 'analiseTempoExecucao.csv'), csvcontent);
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