/// <reference path="./typings/tsd.d.ts" />

//node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Dinamica/uuid' 30 20 'uuid'
//node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Dinamica/pug' 30 20 'pug'

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

var heuristicas = ['RD', 'HC', 'GA'];
//var heuristicas = ['HC', 'RD'];
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
    var caminhoOriginal = DiretorioResultados + `/${heuristicas[0]}/original.js`;

    //instrumentar, executar, salvar

    var codigoOriginal = fs.readFileSync(caminhoOriginal, 'UTF8');
    WriteCodeToFile(arquivoRootBiblioteca, codigoOriginal);

    //Despreza a primeira execuçao
    await ExecutarTeste(DiretorioBiblioteca, bufferOption, 1);

    listaDeFuncoesOriginal = ExtrairListaDeFuncoesComNos(arquivoRootBiblioteca);
    tamanhoArquivoOriginalEmBytes = getFilesizeInBytes(arquivoRootBiblioteca);

    var arquivoDinamicoResultado = path.join(DiretorioBiblioteca, 'original-resultados-dinamico.json');
    var arquivoFuncoesResultado = path.join(DiretorioBiblioteca, 'original-resultados-funcoes.json');
    var arquivoEstaticoResultado = path.join(DiretorioBiblioteca, 'original-resultados-estatico.json');

    rankingEstatico = getFunctionStaticList(caminhoOriginal);

    fs.writeFileSync(arquivoEstaticoResultado, JSON.stringify(rankingEstatico));


    await gerarRankingDinamico(libName, arquivoRootBiblioteca, DiretorioBiblioteca, bufferOption, Quantidade, arquivoDinamicoResultado, arquivoFuncoesResultado, 'original', 0);

    //============================================================================================ Rodadas //>

    for (var j = 0; j < heuristicas.length; j++) {
        var heuristica = heuristicas[j];

        for (var index = 0; index < QuantidadeRodadas; index++) {

            console.log(`Executando rodada ${index} da heuristica ${heuristica}`);

            var caminhoArquivoRodada = DiretorioResultados + "/" + heuristica + "/" + index + ".js";
            if (!fs.existsSync(caminhoArquivoRodada)) {
                console.log(`Arquivo ${caminhoArquivoRodada} não existe!`);
                continue;
            }

            var CodigoDaRodada = fs.readFileSync(caminhoArquivoRodada, 'UTF8');

            if (CodigoDaRodada != codigoOriginal) {

                WriteCodeToFile(arquivoRootBiblioteca, CodigoDaRodada);

                //Instrumenta, executa os testes, avalia
                arquivoDinamicoResultado = path.join(DiretorioBiblioteca, index + '-resultados-dinamico.json');
                arquivoFuncoesResultado = path.join(DiretorioBiblioteca, index + '-resultados-funcoes.json');
                await gerarRankingDinamico(libName, arquivoRootBiblioteca, DiretorioBiblioteca, bufferOption, Quantidade, arquivoDinamicoResultado, arquivoFuncoesResultado, heuristica, index);

                //Volta a cópia de segurança
                fse.copySync(oldLibFilePath, arquivoRootBiblioteca, { "clobber": true });
            }
            else {
                console.log(`   O código é igual ao original`);
            }
        }
    }

    //============================================================================================ Fim //>
    //Volta a cópia de segurança
    fse.copySync(oldLibFilePath, arquivoRootBiblioteca, { "clobber": true });

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
 * Retorna a lista de funções de um arquivo Js
 * @param caminhoOriginal 
 */
function ExtrairListaDeFuncoesComNos(caminhoOriginal: string) {
    var caminho = __dirname.replace('build/', '');
    var functionExtractor = require(caminho + '/heuristics/function-extractor.js');
    var astExplorer = new ASTExplorer();
    var individuo = astExplorer.GenerateFromFile(caminhoOriginal);
    var lista = functionExtractor.interpret(individuo.AST);

    var unique = lista.filter(function (elem, index, self) {
        return index == self.indexOf(elem);
    })

    //console.log(JSON.stringify(unique));

    return unique;

}


/**
* Ranking estático de funções mais utilizadas no código
*/
function getFunctionStaticList(caminhoOriginal: string): Object {
    //must determine ranking of most used functions
    var types = require("ast-types");
    var localCount = {};

    var caminho = __dirname.replace('build', '');
    var functionExtractor = require(caminho + '/heuristics/function-extractor.js');
    var astExplorer = new ASTExplorer();
    var individuo = astExplorer.GenerateFromFile(caminhoOriginal);
    var functions = functionExtractor.interpret(individuo.AST);
    var temp = individuo.ToCode();

    for (var i = 0; i < functions.length; i++) {
        var nome = functions[i].name;
        var total = temp.split('.' + nome).length;
        localCount[nome] = total - 1;
    }

    //console.log(`${JSON.stringify(localCount)}`);

    return localCount;
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
    csvcontent += "Rodada;Algoritmo;Funcao;min;max;media;mediana;duracao;quantidade;estatico" + newLine;

    listaResultados.forEach(element => {
        if (element.passedAllTests)
            csvcontent += `${element.Trial};${element.Heuristic};${element.Function};${element.min};${element.max};${element.median};${element.mean};${element.duration};${element.rounds};${rankingEstatico[element.Function]}` + newLine;
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

/**
 * Instrumenta o código da lib, executa os testes e gera dois arquivos de saída com a contagem dinamica e o tempo de execucao de cada função
 * @param nomeLib 
 * @param caminhoOriginal 
 * @param diretorioBiblioteca 
 * @param buffer 
 * @param qtd 
 */
async function gerarRankingDinamico(nomeLib: string, caminhoOriginal: string, diretorioBiblioteca: string, buffer: Object, qtd: number, arquivoDinamicoResultado: string, arquivoFuncoesResultado: string, heuristica: string, trial: number) {
    //Creates the Inidividual for tests
    var astExplorer: ASTExplorer = new ASTExplorer();
    var individualOverTests = astExplorer.GenerateFromFile(caminhoOriginal);
    var listaDeFuncoes = ExtrairListaDeFuncoes(caminhoOriginal);
    var codigoDoOriginal = individualOverTests.ToCode();
    var arquivoJsonComResultadosFuncoes = arquivoFuncoesResultado;
    var arquivoJsonComResultadosContagemFuncoes = arquivoDinamicoResultado;

    var listaDeFuncoesMutante = ExtrairListaDeFuncoesComNos(arquivoRootBiblioteca);
    var tamanhoArquivoMutanteEmBytes = getFilesizeInBytes(arquivoRootBiblioteca);


    //Monta o Código para inserir na Lib
    var globalName = `__dynamic_counters__`;
    var codigoInicializacao = `function clock(startTime) {var end = process.hrtime(startTime); const convertHrtime = require('convert-hrtime');var resultado = convertHrtime(end);return resultado.ms;}\n`;
    codigoInicializacao += `process.once('exit', ()=>{ saveAllGlobalsOptmizer();}); \n`;
    codigoInicializacao += `global['${globalName}'] = {};\n`;
    codigoInicializacao += `global['${globalName}_startTimeGlobal'] = process.hrtime();
    

function saveAllGlobalsOptmizer(){
    var fs = require('fs');
    try {
        
        //var endSave = clock(global['${globalName}_startTimeGlobal']);
        //global['__dynamic_counters__']['total-apos-arquivos'] = endSave;
        fs.appendFileSync('${arquivoJsonComResultadosFuncoes}', JSON.stringify(global['__dynamic_counters__']) + "\\n");

    } catch (error) {
        fs.appendFileSync("log-client.txt", error);
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

        child_process.execSync('sleep 1');




        /*
        objetoComResultados['total-Instrumentado'] = {
            'name': 'total-Instrumentado',
            'min': resultados.min,
            'max': resultados.max,
            'mean': resultados.mean,
            'median': resultados.median,
            'duration': resultados.duration,
            'count': resultados.rounds,
        };
        */

        //Cada linha uma execucao. Somar tudo
        var objetoComResultados = { total: 0 };
        var totalLinhas = 0;
        fs.readFileSync(arquivoFuncoesResultado).toString().split('\n').forEach(function (line) {
            if (line !== "") {

                totalLinhas++;
                //console.log("linha " + totalLinhas);
                var objBDTempoFuncoes = JSON.parse(line);

                for (var functionNameOptmizer in objBDTempoFuncoes) {
                    if (objetoComResultados[functionNameOptmizer]) {
                        if (functionNameOptmizer === 'toString')
                            continue;

                        objetoComResultados[functionNameOptmizer] = !Array.isArray(objetoComResultados[functionNameOptmizer]) ? [] : objetoComResultados[functionNameOptmizer];
                        objetoComResultados[functionNameOptmizer] = objetoComResultados[functionNameOptmizer].concat(objBDTempoFuncoes[functionNameOptmizer]);
                    }
                    else {

                        objetoComResultados[functionNameOptmizer] = objBDTempoFuncoes[functionNameOptmizer];
                    }
                }
            }
        });

        delete objetoComResultados.total;

        Object.keys(objetoComResultados).forEach(name => {

            var functionNodeMutante = listaDeFuncoesMutante.find((currentValue, index, arr) => { return currentValue.name == name; });
            var functionNodeOriginal = listaDeFuncoesOriginal.find((currentValue, index, arr) => { return currentValue.name == name; });


            var iFuncaoOriginal = new Individual();
            iFuncaoOriginal.Options.comment = false;
            iFuncaoOriginal.AST = functionNodeOriginal.node;

            var iFuncaoMutante = new Individual();
            iFuncaoMutante.Options.comment = false;
            iFuncaoMutante.AST = functionNodeMutante.node;


            //if (heuristica === "original" || (iFuncaoOriginal.ToCode() !== iFuncaoMutante.ToCode() && tamanhoArquivoMutanteEmBytes <= tamanhoArquivoOriginalEmBytes)) {
            if (heuristica === "original" || (iFuncaoOriginal.ToCode() !== iFuncaoMutante.ToCode())) {
                var resultadosInterno = new TestResults();
                var sum = arraySUM(objetoComResultados[name]);
                var avg = sum / objetoComResultados[name].length
                resultadosInterno.Trial = trial.toString();
                resultadosInterno.Function = name;
                resultadosInterno.Heuristic = heuristica;
                resultadosInterno.min = arrayMin(objetoComResultados[name]);
                resultadosInterno.max = arrayMax(objetoComResultados[name]);
                resultadosInterno.mean = avg;
                resultadosInterno.median = getMedian(objetoComResultados[name]);
                resultadosInterno.duration = sum;
                resultadosInterno.rounds = objetoComResultados[name].length;
                resultadosInterno.passedAllTests = true;

                resultadosProcessados.push(resultadosInterno)
            }

        });

        //console.log(arquivoFuncoesResultado);
        if (fs.existsSync(arquivoFuncoesResultado))
            fs.unlinkSync(arquivoFuncoesResultado); //se livra do arquivo

    } catch (error) {
        console.log('Deu ruim:' + error.stack);

        if (fs.existsSync(arquivoFuncoesResultado))
            fs.unlinkSync(arquivoFuncoesResultado); //se livra do arquivo
    }
}

function getFilesizeInBytes(filename): number {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
}