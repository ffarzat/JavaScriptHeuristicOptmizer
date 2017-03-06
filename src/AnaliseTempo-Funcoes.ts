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

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');


var exectimer = require('exectimer');
const child_process = require('child_process');
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
instalarExecTimerNaLib(DiretorioBiblioteca, nomeBiblioteca);
gerarRankingEstatico(caminhoOriginal, DiretorioBiblioteca, arquivoEstaticoResultado);
gerarRankingDinamico(nomeBiblioteca, caminhoOriginal, DiretorioBiblioteca, bufferOption, qtdTestes, arquivoDinamicoResultado, arquivoFuncoesResultado);
//Volta a cópia de segurança
fse.copySync(oldLibFilePath, arquivoRootBiblioteca, { "clobber": true });
executaTestesDoOriginalSemInstrumentacao(DiretorioBiblioteca, bufferOption, arquivoFuncoesResultado, qtdTestes);
//============================================================================================ Escreve os resultados //>
console.log(`Escrever csv com os resultados obtidos`);
EscreverResultadoEmCsv(DiretorioResultados, DiretorioBiblioteca, nomeBiblioteca, arquivoEstaticoResultado, arquivoDinamicoResultado, arquivoFuncoesResultado);

process.exit();

//============================================================================================ Funcoes utilizadas //>
function instalarExecTimerNaLib(diretorio: string, nomeBiblioteca: string) {
    if (nomeBiblioteca === "exectimer")
        return;
    child_process.execSync(`cd ${diretorio} && npm install exectimer`, bufferOption).toString();
}

function executaTestesDoOriginalSemInstrumentacao(DiretorioBiblioteca: string, bufferOption: Object, arquivoFuncoesResultado: string, qtd: number) {
    //Desprezar a primeira execuçao (load de componentes e etc)
    ExecutarTeste(DiretorioBiblioteca, bufferOption, 1);

    //Executa a lib original sem alterações
    var resultados = ExecutarTeste(DiretorioBiblioteca, bufferOption, qtd);

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
function ExecutarTeste(DiretorioBiblioteca: string, bufferOption: any, quantidade: number): TestResults {
    var msgId = uuid.v4();
    var passedAllTests = true;

    var testCMD = `node --expose-gc --max-old-space-size=512000  src/client.js 0 ${DiretorioBiblioteca} ${7200000}`; //timeout bem grande (2 horas)

    if (os.hostname() != "Optmus") {
        child_process.execSync("sleep 1", bufferOption).toString();
    }

    var stdout = "";
    var durations = [];
    var start = process.hrtime();

    setTimeout(function () {
        console.log(`Ainda Testando [${parseMillisecondsIntoReadableTime(clock(start))}]`)
    }, (5 * 60) * 100); //cinco minutos

    for (var index = 0; index < quantidade; index++) {

        try {
            //var Tick = new exectimer.Tick(msgId);
            //Tick.start();
            console.log(`   ${index}x`);

            stdout = child_process.execSync(testCMD, bufferOption).toString();
            //Tick.stop();

            var stringList = stdout.replace(/(?:\r\n|\r|\n)/g, ',');;
            stringList = stringList.substring(0, stringList.length - 1);
            //console.log(`${stringList}`);
            var resultadoJson = JSON.parse(`${stringList}`);
            durations.push(parseInt(resultadoJson.duration) / 1000);

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

    }

    //var unitTestsTimer = exectimer.timers[msgId];
    var resultadoFinal: TestResults = new TestResults();

    var math = require('mathjs');


    resultadoFinal.rounds = quantidade;
    resultadoFinal.min = math.min(durations);
    resultadoFinal.max = math.max(durations);
    resultadoFinal.mean = math.mean(durations);
    resultadoFinal.median = math.median(durations);
    resultadoFinal.duration = math.sum(durations);
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
    var newLine: string = '\n';
    var csvcontent = "";
    //csvcontent += "Name;Static-Calls;Dynamic-Calls;min;max;mean;median;duration;count" + newLine;
    csvcontent += "Name;Static-Calls;Dynamic-Calls;min;max;duration;count" + newLine;

    //ler aquivo estatico
    var objetoEstatico = JSON.parse(fs.readFileSync(arquivoEstaticoResultado).toString());
    
    //ler arquivo com o tempo
    var objetoTempo = JSON.parse(fs.readFileSync(arquivoFuncoesResultado).toString());

    //for por função
    var functions = ExtrairListaDeFuncoes(caminhoOriginal);

    for (var i = 0; i < functions.length; i++) {
        var nome = functions[i];
        if (nome == 'toString') {
            continue;
        }

        var qtdEstatico = objetoEstatico[nome] ? objetoEstatico[nome] : 0;
        var qtdDinamico = objetoTempo[nome] ? objetoTempo[nome].count : 0;
        var min = objetoTempo[nome] ? objetoTempo[nome].min : 0;
        var max = objetoTempo[nome] ? objetoTempo[nome].max : 0;
        var median = objetoTempo[nome] ? objetoTempo[nome].median : 0;
        //var median  =  0;
        var mean = objetoTempo[nome] ? objetoTempo[nome].mean : 0;
        //var mean    = 0;
        var duration = objetoTempo[nome] ? objetoTempo[nome].duration : 0;
        var count = objetoTempo[nome] ? objetoTempo[nome].count : 0;

        csvcontent += `${nome};${qtdEstatico};${qtdDinamico};${ToNanosecondsToSeconds(min)};${ToNanosecondsToSeconds(max)};${ToNanosecondsToSeconds(duration)};${count}` + newLine;
    }

    //Corpo da Lib
    //csvcontent += `${objetoTempo['Corpo-Lib'].name};0;0;${ToNanosecondsToSeconds(objetoTempo['Corpo-Lib'].min)};${ToNanosecondsToSeconds(objetoTempo['Corpo-Lib'].max)};${ToNanosecondsToSeconds(objetoTempo['Corpo-Lib'].duration)};${objetoTempo['Corpo-Lib'].count}` + newLine;

    //tempo total com a instrumentação
    if(objetoTempo['total-Instrumentado'])
        csvcontent += `${objetoTempo['total-Instrumentado'].name};0;0;${objetoTempo['total-Instrumentado'].min};${objetoTempo['total-Instrumentado'].max};${objetoTempo['total-Instrumentado'].duration};${objetoTempo['total-Instrumentado'].count}` + newLine;

    //tempo total Original
    if(objetoTempo['total-original'])
        csvcontent += `${objetoTempo['total-original'].name};0;0;${objetoTempo['total-original'].min};${objetoTempo['total-original'].max};${objetoTempo['total-original'].duration};${objetoTempo['total-original'].count}` + newLine;

    fs.writeFileSync(path.join(DiretorioResultados, `${nomeBiblioteca}-analiseTempoFuncoes.csv`), csvcontent);
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
function gerarRankingDinamico(nomeLib: string, caminhoOriginal: string, diretorioBiblioteca: string, buffer: Object, qtd: number, arquivoDinamicoResultado: string, arquivoFuncoesResultado: string) {
    //Creates the Inidividual for tests
    var astExplorer: ASTExplorer = new ASTExplorer();
    var individualOverTests = astExplorer.GenerateFromFile(caminhoOriginal);
    var listaDeFuncoes = ExtrairListaDeFuncoes(caminhoOriginal);
    var codigoDoOriginal = individualOverTests.ToCode();
    var arquivoJsonComResultadosFuncoes = arquivoFuncoesResultado;
    var arquivoJsonComResultadosContagemFuncoes = arquivoDinamicoResultado;


    //Monta o Código para inserir na Lib
    var globalName = `__${nomeLib}_counter_object`;
    var codigoInicializacao = `function ToNanosecondsToSeconds_Optmizer(nanovalue) {return parseFloat((nanovalue / 1000000.0).toFixed(5));}\n`
    codigoInicializacao += `global['__objeto_raiz_exectimer'] = require('exectimer'); \n`;
    codigoInicializacao += `global['__objeto_raiz_exectimer_Tick'] = global['__objeto_raiz_exectimer'].Tick; \n`;
    codigoInicializacao += `global['${globalName}'] = {};\n`;
    codigoInicializacao += `global['optmizerFunctionsInternalList'] = {};\n`;


    codigoInicializacao += `
    process.once('exit', function (code) { 
        Exit({ name: 'Corpo-Lib' });
    });
    `;

    //Retirando o process.once exit
    /*

    for (var i = 0; i < listaDeFuncoes.length; i++) {

        if (listaDeFuncoes[i] == "toString")
            continue;

        var encerramento = `
            for (var i = 0; i < global['${globalName}_${listaDeFuncoes[i]}'].length; i++) {
                global['${globalName}_${listaDeFuncoes[i]}'][i].stop();
            }

            var resultadoFinal${globalName}_${listaDeFuncoes[i]} = {'name': '${listaDeFuncoes[i]}'};
            if(global['__objeto_raiz_exectimer'].timers['${listaDeFuncoes[i]}'])
            {
                resultadoFinal${globalName}_${listaDeFuncoes[i]}.min = ToNanosecondsToSeconds_Optmizer(global['__objeto_raiz_exectimer'].timers['${listaDeFuncoes[i]}'].min()); 
                resultadoFinal${globalName}_${listaDeFuncoes[i]}.max = ToNanosecondsToSeconds_Optmizer(global['__objeto_raiz_exectimer'].timers['${listaDeFuncoes[i]}'].max()); 
                resultadoFinal${globalName}_${listaDeFuncoes[i]}.mean = ToNanosecondsToSeconds_Optmizer(global['__objeto_raiz_exectimer'].timers['${listaDeFuncoes[i]}'].mean()); 
                resultadoFinal${globalName}_${listaDeFuncoes[i]}.median = ToNanosecondsToSeconds_Optmizer(global['__objeto_raiz_exectimer'].timers['${listaDeFuncoes[i]}'].median()); 
                resultadoFinal${globalName}_${listaDeFuncoes[i]}.duration = ToNanosecondsToSeconds_Optmizer(global['__objeto_raiz_exectimer'].timers['${listaDeFuncoes[i]}'].duration())
                global['${globalName}']['${listaDeFuncoes[i]}'] = resultadoFinal${globalName}_${listaDeFuncoes[i]};
            }

            if(global['${globalName}_Corpo-Lib'].length > 0)
            {
                global['${globalName}_Corpo-Lib'][0].stop();
                var resultadoFinal${globalName}_Corpo_Lib = {'name': 'Corpo-Lib'};
                if(global['__objeto_raiz_exectimer'].timers['Corpo-Lib'])
                {
                    resultadoFinal${globalName}_Corpo_Lib.min = ToNanosecondsToSeconds_Optmizer(global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].min()); 
                    resultadoFinal${globalName}_Corpo_Lib.max = ToNanosecondsToSeconds_Optmizer(global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].max()); 
                    resultadoFinal${globalName}_Corpo_Lib.mean = ToNanosecondsToSeconds_Optmizer(global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].mean()); 
                    resultadoFinal${globalName}_Corpo_Lib.median = ToNanosecondsToSeconds_Optmizer(global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].median()); 
                    resultadoFinal${globalName}_Corpo_Lib.duration = ToNanosecondsToSeconds_Optmizer(global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].duration())
                    global['${globalName}']['Corpo-Lib'] = resultadoFinal${globalName}_Corpo_Lib;
                }
            }

        `
        codigoInicializacao += encerramento;
    }

    codigoInicializacao += `var fs = require("fs"); 
    var objetoComResultadosNoDisco = {};
    if(fs.existsSync('${arquivoGlobalBiblioteca}')){
        objetoComResultadosNoDisco = JSON.parse(fs.readFileSync('${arquivoGlobalBiblioteca}').toString());
        objetoComResultadosNoDisco['total'] = parseInt(objetoComResultadosNoDisco['total']) + 1;
    }
    else{
        objetoComResultadosNoDisco['total'] = 1;
    }
    fs.writeFileSync('${arquivoGlobalBiblioteca}', JSON.stringify(objetoComResultadosNoDisco, null, 4));
    `;
    

    codigoInicializacao += `
        var fs = require('fs');
        fs.writeFileSync('${arquivoJsonComResultadosFuncoes}', JSON.stringify(global['${globalName}'], null, 4));
        fs.writeFileSync('${arquivoJsonComResultadosContagemFuncoes}', JSON.stringify(global['optmizerFunctionsInternalList'], null, 4));
    });
    `
    */

    for (var i = 0; i < listaDeFuncoes.length; i++) {
        var inicializacaoFuncao = `global['${globalName}_${listaDeFuncoes[i]}'] = []; \n`;
        codigoInicializacao += `${inicializacaoFuncao}`;
    }

    var inicializacaoCorpo = `global['${globalName}_Corpo-Lib'] = []; \n`;
    codigoInicializacao += `${inicializacaoCorpo}`;

    var caminho = __dirname.replace('build', '');
    var esmorph = require(caminho + '/../src/esmorph-new.js');
    var modifiers;

    modifiers = [];
    modifiers.push(esmorph.Tracer.FunctionEntrance('Enter'));
    modifiers.push(esmorph.Tracer.FunctionExit('Exit'));

    var morphed = esmorph.modify(codigoDoOriginal, modifiers);

    var ifFinal = `if( global['${globalName}_${listaDeFuncoes[0]}'].length == 0`;
    for (var i = 1; i < listaDeFuncoes.length; i++) {
        ifFinal += ` && global['${globalName}_${listaDeFuncoes[i]}'].length == 0`;
    }
    ifFinal += `){

                    if(global['${globalName}_Corpo-Lib'][0])
                    {
                        global['${globalName}_Corpo-Lib'][0].stop();
                        var resultadoFinal${globalName}_Corpo_Lib = {'name': 'Corpo-Lib'};
                        
                        if(global['__objeto_raiz_exectimer'].timers['Corpo-Lib'])
                        {
                            resultadoFinal${globalName}_Corpo_Lib.min = (global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].min()); 
                            resultadoFinal${globalName}_Corpo_Lib.max = (global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].max()); 
                            resultadoFinal${globalName}_Corpo_Lib.mean = (global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].mean()); 
                            resultadoFinal${globalName}_Corpo_Lib.median = (global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].median()); 
                            resultadoFinal${globalName}_Corpo_Lib.duration = (global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].duration())
                            resultadoFinal${globalName}_Corpo_Lib.count = parseInt(global['__objeto_raiz_exectimer'].timers['Corpo-Lib'].count())
                            global['${globalName}']['Corpo-Lib'] = resultadoFinal${globalName}_Corpo_Lib;
                        }
                    }
                    var fs = require('fs');
                    var objBDTempoFuncoes = {};

                    if(fs.existsSync('${arquivoJsonComResultadosFuncoes}')){
                        var conteudo = fs.readFileSync('${arquivoJsonComResultadosFuncoes}').toString();
                        if(conteudo == "")
                            conteudo = {};

                        objBDTempoFuncoes = JSON.parse(conteudo);
                        
                        for (functionNameOptmizer in global['${globalName}'])
                        {
                            if(objBDTempoFuncoes[functionNameOptmizer])
                            {
                                objBDTempoFuncoes[functionNameOptmizer].min = parseFloat(objBDTempoFuncoes[functionNameOptmizer].min) < parseFloat(global['${globalName}'][functionNameOptmizer].min) ? parseFloat(objBDTempoFuncoes[functionNameOptmizer].min) :  parseFloat(global['${globalName}'][functionNameOptmizer].min) ;
                                objBDTempoFuncoes[functionNameOptmizer].max = parseFloat(objBDTempoFuncoes[functionNameOptmizer].max) > parseFloat(global['${globalName}'][functionNameOptmizer].max) ? parseFloat(objBDTempoFuncoes[functionNameOptmizer].max): parseFloat(global['${globalName}'][functionNameOptmizer].max);
                                objBDTempoFuncoes[functionNameOptmizer].mean = 0; //((parseFloat(objBDTempoFuncoes[functionNameOptmizer].mean) + parseFloat(global['${globalName}'][functionNameOptmizer].mean)) /2) / 1000;
                                objBDTempoFuncoes[functionNameOptmizer].median = 0; //parseFloat(objBDTempoFuncoes[functionNameOptmizer].min) + parseFloat(global['${globalName}'][functionNameOptmizer].median);
                                objBDTempoFuncoes[functionNameOptmizer].duration = (parseFloat(objBDTempoFuncoes[functionNameOptmizer].duration) + parseFloat(global['${globalName}'][functionNameOptmizer].duration) );
                                objBDTempoFuncoes[functionNameOptmizer].count = parseInt(objBDTempoFuncoes[functionNameOptmizer].count) + parseInt(global['${globalName}'][functionNameOptmizer].count);
                            }
                            else{
                                objBDTempoFuncoes[functionNameOptmizer] = global['${globalName}'][functionNameOptmizer];
                            }
                        }
                    }
                    
                    fs.writeFileSync('${arquivoJsonComResultadosFuncoes}', JSON.stringify(objBDTempoFuncoes, null, 4));
                    
        }`;


    //Jogo a inicializacao no começo de todo o código
    morphed = codigoInicializacao + '\n\n' + `\n\n 
        function Enter(details){
            if(details.name == "toString")
                return;

            if(global['${globalName}_'+details.name])
            {
                var p = new global['__objeto_raiz_exectimer_Tick'](details.name);
                p.start();
                global['${globalName}_'+details.name].push(p);
            }
        }

        function Exit(details){
            if(details.name == "toString")
                return;
               
            if(global['${globalName}']  && global['${globalName}_' + details.name])
            {
                var p = global['${globalName}_'+details.name].pop();
                p.stop();
                var resultadoFinal = {'name': details.name};
                resultadoFinal.min = (global['__objeto_raiz_exectimer'].timers[details.name].min()); 
                resultadoFinal.max = (global['__objeto_raiz_exectimer'].timers[details.name].max()); 
                resultadoFinal.mean = (global['__objeto_raiz_exectimer'].timers[details.name].mean()); 
                resultadoFinal.median = (global['__objeto_raiz_exectimer'].timers[details.name].median()); 
                resultadoFinal.duration = (global['__objeto_raiz_exectimer'].timers[details.name].duration());
                resultadoFinal.count = (global['__objeto_raiz_exectimer'].timers[details.name].count());

                global['${globalName}'][details.name] = resultadoFinal;
                            
                global['optmizerFunctionsInternalList'][details.name] = isNaN(global['optmizerFunctionsInternalList'][details.name])? 0 : parseInt(global['optmizerFunctionsInternalList'][details.name]) + parseInt(1);
            }

            ` + ifFinal + `            
        }
        
        Enter({ name: 'Corpo-Lib' });
        \n\n\n` + morphed;

    //Salva o código modificado
    fs.writeFileSync(caminhoOriginal, morphed);
    fs.writeFileSync(caminhoOriginal + '.txt', morphed); //copia para debug

    //executa os testes
    try {
        var resultados = ExecutarTeste(diretorioBiblioteca, buffer, qtd);
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

/**
 * Milisecs F
 */
function clock(startTime): any {
    if (!startTime) return process.hrtime();
    var end = process.hrtime(startTime);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
}