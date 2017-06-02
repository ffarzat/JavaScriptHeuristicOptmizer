/// <reference path="./typings/tsd.d.ts" />

//node build/src/GerarPlanilhaGlobal.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/uuid' 30 20 'uuid'

import ASTExplorer from './ASTExplorer';
import TestResults from './TestResults';
import Individual from './Individual';


import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');

var exectimer = require('exectimer');
const child_process = require('child_process');
var uuid = require('node-uuid');
var bufferOption = { maxBuffer: 1024 * 5000 }
var UglifyJS = require("uglify-es");

var uglifyOptions = {
    mangle: true,
    compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: true
    }
};

var heuristicas = ['HC3', 'HC4', 'HC5'];
var DiretorioBiblioteca = process.argv[2].replace("'", "");
var arquivoRootBiblioteca = process.argv[3].replace("'", "");
var DiretorioResultados = process.argv[4].replace("'", "");
var QuantidadeRodadas = parseInt(process.argv[5]);
var Quantidade = parseInt(process.argv[6]);
var libName = process.argv[7].replace("'", "");
var resultadosProcessados = [];
var os = require("os");
var listaDeFuncoesOriginal = [];
var rankingEstatico = {};
var tamanhoArquivoOriginalEmBytes = 0;

arquivoRootBiblioteca = path.join(DiretorioBiblioteca, arquivoRootBiblioteca);
var caminhoOriginal = DiretorioResultados + `/${heuristicas[0]}/original.js`;
var codigoOriginal = fs.readFileSync(caminhoOriginal, 'UTF8');
var originalLoc = 0;
var originalChar = 0;

console.log(`${DiretorioBiblioteca}`);
console.log(`${arquivoRootBiblioteca}`);
console.log(`${DiretorioResultados}`);
console.log(`Verificar as ${QuantidadeRodadas} rodadas existentes`);
console.log(`Executar os testes ${Quantidade} vezes`);
console.log(`Nome da Lib: ${libName}`);


//Copia de segurança
var oldLibFilePath = path.join(DiretorioBiblioteca, 'old.js');
if (!fs.existsSync(oldLibFilePath))
    fse.copySync(arquivoRootBiblioteca, oldLibFilePath, { "clobber": true });

Executar();

//============================================================================================ Original //>
async function Executar() {


    //instrumentar, executar, salvar

    WriteCodeToFile(arquivoRootBiblioteca, codigoOriginal);

    //Despreza a primeira execuçao
    if (Quantidade > 0)
        await ExecutarTeste(DiretorioBiblioteca, bufferOption, 1);

    tamanhoArquivoOriginalEmBytes = getFilesizeInBytes(arquivoRootBiblioteca);

    var resultadoOriginal = await ExecutarTeste(DiretorioBiblioteca, bufferOption, Quantidade);

    //Gerar versão minified


    var result = UglifyJS.minify(codigoOriginal, uglifyOptions);

    resultadoOriginal.Heuristic = 'Original';
    resultadoOriginal.Loc = result.code.split(/\r\n|\r|\n/).length;
    resultadoOriginal.Chars = result.code.length;
    resultadoOriginal.Trial = "-";
    resultadoOriginal.duration = 0;
    originalLoc = resultadoOriginal.Loc;
    originalChar = resultadoOriginal.Chars;

    resultadosProcessados.push(resultadoOriginal);

    //============================================================================================ Rodadas //>

    for (var j = 0; j < heuristicas.length; j++) {
        var heuristica = heuristicas[j];
        var BestLoc = originalLoc;
        var BestChars = originalChar;
        var BestResult: TestResults = JSON.parse(JSON.stringify(resultadoOriginal));

        BestResult.Heuristic = heuristica;
        BestResult.duration = 0;
        BestResult.Trial = "N/A";

        for (var index = 0; index < QuantidadeRodadas; index++) {

            console.log(`Executando rodada ${index} da heuristica ${heuristica}`);

            var caminhoArquivoRodada = DiretorioResultados + "/" + heuristica + "/" + index + ".js";
            var caminhoArquivoCVSRodada = DiretorioResultados + "/" + heuristica + "/" + index + "-Results.csv";
            var caminhoArquivoCVSRodadaAlterado = DiretorioResultados + "/" + heuristica + "/Results_sep.csv";

            if (!fs.existsSync(caminhoArquivoRodada)) {
                console.log(`Arquivo ${caminhoArquivoRodada} não existe!`);
                continue;
            }

            var CodigoDaRodada = fs.readFileSync(caminhoArquivoRodada, 'UTF8');

            if (CodigoDaRodada != codigoOriginal) {
                WriteCodeToFile(arquivoRootBiblioteca, CodigoDaRodada);

                var resultadoFinal = await ExecutarTeste(DiretorioBiblioteca, bufferOption, Quantidade);
                if(!resultadoFinal.passedAllTests){
                    console.log("Falhou nos testes!")
                    continue;
                }
                
                resultadoFinal.Heuristic = heuristica;

                var result = UglifyJS.minify(CodigoDaRodada, uglifyOptions);
                if (result.code == undefined)
                    console.log(result);

                resultadoFinal.Loc = result.code.split(/\r\n|\r|\n/).length;
                resultadoFinal.Chars = result.code.length;

                if (resultadoFinal.passedAllTests && resultadoFinal.Chars < BestChars) {

                    var fileContents = fs.readFileSync(caminhoArquivoCVSRodada).toString().replace('sep=,\n', '');
                    if (fileContents.length === 0) {
                        console.log(`Arquivo ${caminhoArquivoCVSRodada} não possui registros!`);
                        continue;
                    }

                    fs.writeFileSync(caminhoArquivoCVSRodadaAlterado, fileContents);
                    var loader = require('csv-load-sync');
                    var csv = loader(caminhoArquivoCVSRodadaAlterado, {
                        getColumns: split
                    });;

                    resultadoFinal.Trial = String(index);
                    resultadoFinal.duration = csv[0].time;
                    BestResult = resultadoFinal;
                    BestChars = resultadoFinal.Chars;
                    BestLoc = resultadoFinal.Loc;
                }

                //Volta a cópia de segurança
                fse.copySync(oldLibFilePath, arquivoRootBiblioteca, { "clobber": true });
            }
            else {
                console.log(`   O código é igual ao original`);
            }
        }

        resultadosProcessados.push(BestResult);
    }

    //============================================================================================ Fim //>
    //Volta a cópia de segurança
    fse.copySync(oldLibFilePath, arquivoRootBiblioteca, { "clobber": true });
    fse.unlinkSync(caminhoArquivoCVSRodadaAlterado);
    console.log(`Escrever csv com ${resultadosProcessados.length} resultados obtidos`);

    EscreverResultadoEmCsv(DiretorioResultados, resultadosProcessados);

    process.exit();
}

/**
 * Salva o código por cima do da Lib atual
 */
function WriteCodeToFile(caminho: string, codigo: string) {
    fs.writeFileSync(caminho, codigo);
}

/**
 * Executa os testes e recupera os valores
 */
async function ExecutarTeste(DiretorioBiblioteca: string, bufferOption: any, quantidade: number): Promise<TestResults> {
    var msgId = uuid.v4();
    var passedAllTests = true;

    var testCMD = `node --expose-gc --max-old-space-size=2047 'src/client.js' ${msgId} ${DiretorioBiblioteca} 3600000`;

    var stdout = "";
    var durations = [];
    var start = process.hrtime();

    for (var index = 0; index < quantidade; index++) {

        try {
            console.log(`   ${index}x`);

            var promessaDoBem = new Promise<string>((resolve, reject) => {
                var processo = child_process.exec(testCMD, bufferOption, (erro: Error, stdout: string, stderr: string) => {
                    processo.kill();
                    erro ? reject(erro) : resolve(stdout);
                });

            });

            stdout = await promessaDoBem;

            var stringList = stdout.replace(/(?:\r\n|\r|\n)/g, ',');;
            stringList = stringList.substring(0, stringList.length - 1);
            //console.log(`${stringList}`);
            var resultadoJson = JSON.parse(`${stringList}`);

            if (resultadoJson.sucess == "false") {
                passedAllTests = false;
                break;
            }

        } catch (error) {
            console.log(`testCMD: ${testCMD}`);
            console.log(`stdout: ${stdout}`);
            console.log(`${error.stack}`);

            //Tick.stop();
            passedAllTests = false;
            break;
        }
        finally {
            durations.push(clock(start));
        }

    }

    //var unitTestsTimer = exectimer.timers[msgId];
    var resultadoFinal: TestResults = new TestResults();

    var sum = arraySUM(durations);
    var avg = sum / durations.length;

    resultadoFinal.rounds = quantidade;
    resultadoFinal.min = arrayMin(durations);
    resultadoFinal.max = arrayMax(durations);
    resultadoFinal.mean = avg;
    resultadoFinal.median = getMedian(durations);
    resultadoFinal.duration = sum;
    resultadoFinal.rounds = quantidade;
    resultadoFinal.passedAllTests = passedAllTests;

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
    //var csvcontent = "sep=;" + newLine;
    var csvcontent = "";
    csvcontent += "Lib;Heuristic;Trial;Lines;% Improved Loc;Chars;% Improved Chars;Time Spent" + newLine;

    listaResultados.forEach(element => {
        var improvedLoc = ((originalLoc - element.Loc) / originalLoc);
        improvedLoc = improvedLoc < 0 ? improvedLoc * -1 : improvedLoc;

        var improvedChars = ((originalChar - element.Chars) / originalChar);
        improvedChars = improvedChars < 0 ? improvedChars * -1 : improvedChars;


        csvcontent += `${libName};${element.Heuristic};${element.Trial};${element.Loc};${String(improvedLoc).replace('.', ',')};${element.Chars};${String(improvedChars).replace('.', ',')};${element.duration}` + newLine;

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

//1 second is equal to 1000000000 nanoseconds, or 1000 milliseconds.
function clock(startTime): number {
    var end = process.hrtime(startTime);
    const convertHrtime = require('convert-hrtime');
    var resultado = convertHrtime(end);
    return resultado.ms;
}

function arrayMin(arr) {
    var len = arr.length, min = Infinity;
    while (len--) {
        if (parseFloat(arr[len]) < min) {
            min = arr[len];
        }
    }
    return min;
};

function arrayMax(arr) {
    var len = arr.length, max = -Infinity;
    while (len--) {
        if (parseFloat(arr[len]) > max) {
            max = arr[len];
        }
    }
    return max;
};

function arraySUM(arr) {
    var len = arr.length;
    var total = 0;
    while (len--) {
        total += parseFloat(arr[len]);
    }
    return total;
};

function getMedian(args) {
    if (!args.length) { return 0 };
    var numbers = args.slice(0).sort((a, b) => a - b);
    var middle = Math.floor(numbers.length / 2);
    var isEven = numbers.length % 2 === 0;
    return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
}

function getFilesizeInBytes(filename): number {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
}

function split(line, lineNumber) {
    if (lineNumber === 0) { // title line
        return line.split(',')
    }
    var parts = line.split(',')
    return [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7] + ',' + parts[8], parts[9]];
}
