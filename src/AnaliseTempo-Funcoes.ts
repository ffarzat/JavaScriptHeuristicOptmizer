/// <reference path="./typings/tsd.d.ts" />

//node build/src/AnaliseTempo-Funcoes.js 'uuid' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'exectimer' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'bower' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/bower' 'lib/core/Manager.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'plivo-node' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'xml2js' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/xml2js' '/lib/xml2js.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'jquery' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/jquery' 'dist/jquery.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'moment' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/moment' 'moment.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'lodash' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/lodash' 'lodash.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'pug' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'minimist' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'node-browserify' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/node-browserify' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1

//Não vai de jeito nenhum
//node build/src/AnaliseTempo-Funcoes.js 'express-ifttt-webhook' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/express-ifttt-webhook' 'lib/webhook.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'tleaf' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1
//node build/src/AnaliseTempo-Funcoes.js 'underscore' '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/underscore' 'underscore.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Tempo-Funcoes/' 1


import ASTExplorer from './ASTExplorer';
import TestResults from './TestResults';

import * as child_process from 'child_process';

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');


var exectimer = require('exectimer');

var uuid = require('node-uuid');
var bufferOption = { maxBuffer: 1024 * 5000 }

var nomeBiblioteca = process.argv[2].replace("'", "");
var DiretorioBiblioteca = process.argv[3].replace("'", "");
var arquivoRootBiblioteca = process.argv[4].replace("'", "");
var DiretorioResultados = process.argv[5].replace("'", "");
var qtdTestes = parseInt(process.argv[6].replace("'", ""));
var os = require("os");
nomeBiblioteca = nomeBiblioteca.replace("-", "_");
arquivoRootBiblioteca = path.join(DiretorioBiblioteca, arquivoRootBiblioteca);

var arquivoEstaticoResultado = path.join(DiretorioBiblioteca, 'resultados-estatico.json');
var arquivoDinamicoResultado = path.join(DiretorioBiblioteca, 'resultados-dinamico.json');
var arquivoFuncoesResultado = path.join(DiretorioBiblioteca, 'resultados-funcoes.json');
var arquivoGlobalBiblioteca = path.join(DiretorioBiblioteca, 'resultados.json');

console.log(`${DiretorioBiblioteca}`);
console.log(`${arquivoRootBiblioteca}`);

//Copia de segurança
var oldLibFilePath = path.join(DiretorioBiblioteca, 'old.js');
if (!fs.existsSync(oldLibFilePath))
    fse.copySync(arquivoRootBiblioteca, oldLibFilePath, { "clobber": true });

//Caso os arquivos existam limpa eles
limparArquivo(arquivoEstaticoResultado);
limparArquivo(arquivoDinamicoResultado);
limparArquivo(arquivoFuncoesResultado);
limparArquivo(arquivoGlobalBiblioteca);

//============================================================================================ Original //>

var caminhoOriginal = `${arquivoRootBiblioteca}`;
var codigoOriginal = fs.readFileSync(caminhoOriginal, 'UTF8');

//============================================================================================ Gera os Rankings //>

gerarRankingEstatico(caminhoOriginal, DiretorioBiblioteca, arquivoEstaticoResultado);

gerarRankingDinamico(nomeBiblioteca, caminhoOriginal, DiretorioBiblioteca, bufferOption, qtdTestes, arquivoDinamicoResultado, arquivoFuncoesResultado).then(() => {

    //Volta a cópia de segurança
    fse.copySync(oldLibFilePath, arquivoRootBiblioteca, { "clobber": true });
    executaTestesDoOriginalSemInstrumentacao(DiretorioBiblioteca, bufferOption, arquivoFuncoesResultado, qtdTestes).then(() => {
        //============================================================================================ Escreve os resultados //>
        console.log(`Escrever csv com os resultados obtidos`);
        EscreverResultadoEmCsv(DiretorioResultados, DiretorioBiblioteca, nomeBiblioteca, arquivoEstaticoResultado, arquivoDinamicoResultado, arquivoFuncoesResultado);

        process.exit();
    }).catch((erro: any) => {
        console.log(erro);
    });


}).catch((erro: any) => {
    console.log(erro);
});

//============================================================================================ Funcoes utilizadas //>
async function executaTestesDoOriginalSemInstrumentacao(DiretorioBiblioteca: string, bufferOption: Object, arquivoFuncoesResultado: string, qtd: number): Promise<void> {

    //Desprezar a primeira execuçao (load de componentes e etc)
    ExecutarTeste(DiretorioBiblioteca, bufferOption, 1);

    //Executa a lib original sem alterações
    var resultados = await ExecutarTeste(DiretorioBiblioteca, bufferOption, qtd);

    //Inclui o total observado da lib inteira
    var objetoComResultados = JSON.parse(fs.readFileSync(arquivoFuncoesResultado).toString());
    objetoComResultados['total-original'] = {
        'name': 'total-original',
        'min': resultados.min,
        'max': resultados.max,
        'mean': resultados.mean,
        'median': resultados.median,
        'duration': resultados.duration,
        'count': resultados.rounds,
    };

    //console.log(`total-original: ${objetoComResultados['total-original']['duration']}`);
    fs.writeFileSync(arquivoFuncoesResultado, JSON.stringify(objetoComResultados, null, 4));
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
            console.log(`${stringList}`);
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

    var math = require('mathjs');

    resultadoFinal.rounds = quantidade;
    resultadoFinal.min = math.min(durations);
    resultadoFinal.max = math.max(durations);
    resultadoFinal.mean = math.mean(durations);;
    resultadoFinal.median = math.median(durations);
    resultadoFinal.duration = math.sum(durations);;
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
function EscreverResultadoEmCsv(DiretorioResultados: string, DiretorioBiblioteca: string, nomeBiblioteca: string, arquivoEstaticoResultado: string, arquivoDinamicoResultado: string, arquivoFuncoesResultado: string) {
    var jsonResultadosDinamicos = {};
    var newLine: string = '\n';
    var csvcontent = "";
    csvcontent += "Name;Static-Calls;Dynamic-Calls;min;max;mean;median;duration" + newLine;
    //ler aquivo estatico
    var objetoEstatico = JSON.parse(fs.readFileSync(arquivoEstaticoResultado).toString());
    //ler arquivo dinamico
    var objetoTempo = JSON.parse(fs.readFileSync(arquivoFuncoesResultado).toString());

    //for por função
    var functions = ExtrairListaDeFuncoes(caminhoOriginal);

    for (var i = 0; i < functions.length; i++) {
        var nome = functions[i];
        //if (nome == 'toString') {
        //continue;
        //}


        var qtdEstatico = objetoEstatico[nome] ? objetoEstatico[nome] : 0;
        var qtdDinamico = objetoTempo[nome] ? objetoTempo[nome].length : 0;

        jsonResultadosDinamicos[nome] = qtdDinamico;

        var min = 0;
        var max = 0;
        var mean = 0;
        var median = 0;
        var duration = 0;


        if (objetoTempo[nome]) {
            min = objetoTempo[nome] ? arrayMin(objetoTempo[nome]) : 0;
            max = objetoTempo[nome] ? arrayMax(objetoTempo[nome]) : 0;

            var sum = arraySUM(objetoTempo[nome]);
            var avg = sum / objetoTempo[nome].length;

            mean = objetoTempo[nome] ? avg : 0;

            median = objetoTempo[nome] ? getMedian(objetoTempo[nome]) : 0;
            
            duration = objetoTempo[nome] ? sum : 0;
        }

        csvcontent += `${nome};${qtdEstatico};${qtdDinamico};${min};${max};${mean};${median};${duration}` + newLine;
    }

    //tempo total com a instrumentação
    if (objetoTempo['total']) {
        var count = objetoTempo['total'] ? objetoTempo['total'].length : 0;
        var min_Total = objetoTempo['total'] ? arrayMin(objetoTempo['total']) : 0;
        var max_total = objetoTempo['total'] ? arrayMax(objetoTempo['total']) : 0;

        var sum = arraySUM(objetoTempo['total']);
        var avg = sum / objetoTempo['total'].length;

        var mean_total = objetoTempo['total'] ? avg : 0;
        
        var median_total = objetoTempo['total'] ? getMedian(objetoTempo['total']) : 0;
        
        var duration_total = objetoTempo['total'] ? sum : 0;

        csvcontent += `Total-Interno-Lib;0;${count};${min_Total};${max_total};${mean_total};${median_total};${duration_total}` + newLine;
    }

    if (objetoTempo['total-apos-arquivos'])
        csvcontent += `Total-Apos-Save;0;0;${objetoTempo['total-apos-arquivos']};${objetoTempo['total-apos-arquivos']};${objetoTempo['total-apos-arquivos']};${objetoTempo['total-apos-arquivos']};${objetoTempo['total-apos-arquivos']}` + newLine;

    //tempo total com a instrumentação
    if (objetoTempo['total-Instrumentado'])
        csvcontent += `Total NPM Instrumentado;0;0;${objetoTempo['total-Instrumentado'].min};${objetoTempo['total-Instrumentado'].max};${objetoTempo['total-Instrumentado'].mean};${objetoTempo['total-Instrumentado'].median};${objetoTempo['total-Instrumentado'].duration}` + newLine;

    //tempo total Original
    if (objetoTempo['total-original'])
        csvcontent += `Total-NPM-Original;0;0;${objetoTempo['total-original'].min};${objetoTempo['total-original'].max};${objetoTempo['total-original'].mean};${objetoTempo['total-original'].median};${objetoTempo['total-original'].duration}` + newLine;

    fs.writeFileSync(path.join(DiretorioResultados, `${nomeBiblioteca}-analiseTempoFuncoes.csv`), csvcontent);
    fs.writeFileSync(arquivoDinamicoResultado, JSON.stringify(jsonResultadosDinamicos, null, 4));
}

/**
 * Transforma nanosecs em formato de hora (hh:mm:ss)
 * @param milliseconds 
 */
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
 * Conta quantas vezes cada função é invocada no codigo do arquivo Js
 * @param caminhoOriginal 
 */
function gerarRankingEstatico(caminhoOriginal: string, diretorioBiblioteca: string, arquivoEstaticoResultado: string) {
    var localCount = {};
    var astExplorer = new ASTExplorer();
    var individuo = astExplorer.GenerateFromFile(caminhoOriginal);
    var functions = ExtrairListaDeFuncoes(caminhoOriginal);
    var temp = individuo.ToCode();

    for (var i = 0; i < functions.length; i++) {
        var nome = functions[i];
        var totalPonto = temp.split('.' + nome).length - 1;
        var totalReturn = temp.split(' ' + nome + '(').length - 1;
        localCount[nome] = totalPonto + totalReturn;
    }

    fs.writeFileSync(arquivoEstaticoResultado, JSON.stringify(localCount, null, 4));
}

/**
 * Retorna a lista de funções de um arquivo Js
 * @param caminhoOriginal 
 */
function ExtrairListaDeFuncoes(caminhoOriginal: string) {
    var caminho = __dirname.replace('build/', '');
    var functionExtractor = require(caminho + '/heuristics/function-extractor.js');
    var astExplorer = new ASTExplorer();
    var individuo = astExplorer.GenerateFromFile(caminhoOriginal);
    var lista = functionExtractor.interpret(individuo.AST);
    var listaApenasComNomes = [];

    lista.forEach(element => {
        listaApenasComNomes.indexOf(element.name == -1)
        listaApenasComNomes.push(element.name);
    });

    var unique = listaApenasComNomes.filter(function (elem, index, self) {
        return index == self.indexOf(elem);
    })

    //console.log(JSON.stringify(unique));

    return unique;

}

/**
 * Instrumenta o código da lib, executa os testes e gera dois arquivos de saída com a contagem dinamica e o tempo de execucao de cada função
 * @param nomeLib 
 * @param caminhoOriginal 
 * @param diretorioBiblioteca 
 * @param buffer 
 * @param qtd 
 */
async function gerarRankingDinamico(nomeLib: string, caminhoOriginal: string, diretorioBiblioteca: string, buffer: Object, qtd: number, arquivoDinamicoResultado: string, arquivoFuncoesResultado: string) {
    //Creates the Inidividual for tests
    var astExplorer: ASTExplorer = new ASTExplorer();
    var individualOverTests = astExplorer.GenerateFromFile(caminhoOriginal);
    var listaDeFuncoes = ExtrairListaDeFuncoes(caminhoOriginal);
    var codigoDoOriginal = individualOverTests.ToCode();
    var arquivoJsonComResultadosFuncoes = arquivoFuncoesResultado;
    var arquivoJsonComResultadosContagemFuncoes = arquivoDinamicoResultado;




    //Monta o Código para inserir na Lib
    var globalName = `__dynamic_counters__`;
    var codigoInicializacao = `function clock(startTime) {var end = process.hrtime(startTime); const convertHrtime = require('convert-hrtime');var resultado = convertHrtime(end);return resultado.ms;}\n`;
    codigoInicializacao += `process.once('exit', ()=>{ saveAllGlobalsOptmizer();}); \n`;
    codigoInicializacao += `global['${globalName}'] = {};\n`;
    codigoInicializacao += `global['${globalName}_startTimeGlobal'] = process.hrtime();
    

function saveAllGlobalsOptmizer(){
    var fs = require('fs');
    var objBDTempoFuncoes = {}; 
    

    if(fs.existsSync('${arquivoJsonComResultadosFuncoes}')){
 
        var conteudo = fs.readFileSync('${arquivoJsonComResultadosFuncoes}').toString();
        objBDTempoFuncoes = JSON.parse(conteudo);
                    
        for (var functionNameOptmizer in global['${globalName}'])
        {
            if(objBDTempoFuncoes[functionNameOptmizer])
            {
                if(functionNameOptmizer === 'toString')
                    continue;
                    
                objBDTempoFuncoes[functionNameOptmizer] = !Array.isArray(objBDTempoFuncoes[functionNameOptmizer]) ? [] : objBDTempoFuncoes[functionNameOptmizer];
                objBDTempoFuncoes[functionNameOptmizer] = objBDTempoFuncoes[functionNameOptmizer].concat(global['__dynamic_counters__'][functionNameOptmizer]);
            }
            else{
                
                objBDTempoFuncoes[functionNameOptmizer] = global['${globalName}'][functionNameOptmizer];
            }
        }
        var endSave = clock(global['${globalName}_startTimeGlobal']);
        objBDTempoFuncoes['total-apos-arquivos'] = endSave;
        fs.writeFileSync('${arquivoJsonComResultadosFuncoes}', JSON.stringify(objBDTempoFuncoes, null, 4));
    }
    else {
        var endSave = clock(global['${globalName}_startTimeGlobal']);
        global['__dynamic_counters__']['total-apos-arquivos'] = endSave;
        fs.writeFileSync('${arquivoJsonComResultadosFuncoes}', JSON.stringify(global['__dynamic_counters__'], null, 4));
    }
}`;


    var caminho = __dirname.replace('build', '');
    var esmorph = require(caminho + '/../src/esmorph-new.js');
    var modifiers;

    modifiers = [];
    modifiers.push(esmorph.Tracer.InstrumentableFunctionEntranceForTime(''));
    modifiers.push(esmorph.Tracer.InstrumentableFunctionExitForTime(''));

    var morphed = esmorph.modify(codigoDoOriginal, modifiers);
    //Jogo a inicializacao no começo de todo o código
    morphed = codigoInicializacao + `\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n //================================================================= \n` + morphed;

    //Salva o código modificado
    fs.writeFileSync(caminhoOriginal, morphed);
    fs.writeFileSync(caminhoOriginal + '.txt', morphed); //copia para debug

    //executa os testes
    try {
        var resultados = await ExecutarTeste(diretorioBiblioteca, buffer, qtd);
        console.log(`   Testes concluídos [${resultados.passedAllTests}]`);

        var objetoComResultados = JSON.parse(fs.readFileSync(arquivoFuncoesResultado).toString());
        objetoComResultados['total-Instrumentado'] = {
            'name': 'total-Instrumentado',
            'min': resultados.min,
            'max': resultados.max,
            'mean': resultados.mean,
            'median': resultados.median,
            'duration': resultados.duration,
            'count': resultados.rounds,
        };
        fs.writeFileSync(arquivoFuncoesResultado, JSON.stringify(objetoComResultados, null, 4));

    } catch (error) {
        console.log('Deu ruim:' + error.stack);
    }
}

function limparArquivo(caminhoArquivo) {

    if (fs.existsSync(caminhoArquivo)) {
        fs.unlinkSync(caminhoArquivo)
        console.log(`Excluindo arquivo ${caminhoArquivo}...`)
    }
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
  if (!args.length) {return 0};
  var numbers = args.slice(0).sort((a,b) => a - b);
  var middle = Math.floor(numbers.length / 2);
  var isEven = numbers.length % 2 === 0;
  return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
}