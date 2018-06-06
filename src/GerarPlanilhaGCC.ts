/// <reference path="./typings/tsd.d.ts" />

//node build/src/GerarPlanilhaGCC.js '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/gcc/' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC/'
import ASTExplorer from './ASTExplorer';
import TestResults from './TestResults';
import Individual from './Individual';

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');

import esprima = require('esprima');

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

var os = require("os");
var heuristicas = ['HC'];
var DiretorioGcc = process.argv[2].replace("'", "");
var DiretorioResultados = process.argv[3].replace("'", "");

Executar();

//============================================================================================ Original //>
async function Executar() {
    var tamanhoArquivoOriginalEmBytes
    var originalLoc = 0;
    var originalChar = 0;
    var originalIns = 0;

    var tamanhoArquivoMelhorEmBytes;
    var melhorLoc = 0;
    var melhorChar = 0;
    var melhorIns = 0;

    var tamanhoArquivoGCCEmBytes;
    var gccLoc = 0;
    var gccChar = 0;
    var gccIns = 0;

    var libs = getDirectories(DiretorioResultados);
    //console.log(libs);

    var resultados = [];

    resultados.push (`lib,originalBytes,DFAHCBytes,GCCBytes,originalChars,DFAHCChars,GCCChars,orignalInstructions,DFAHCInstructions,GCCInstructions`);

    libs.forEach(library => {
        var caminhoOriginal = DiretorioResultados + `${library}/${heuristicas[0]}/original.js`;
        var caminhoMelhor = DiretorioResultados + `${library}/${heuristicas[0]}/0.js`;
        var caminhoGCC = DiretorioGcc + `${library}.js`;
        var codigoOriginal = fs.readFileSync(caminhoOriginal, 'UTF8');
        var codigoMelhor = fs.readFileSync(caminhoMelhor, 'UTF8');
        var codigoGCC = fs.readFileSync(caminhoGCC, 'UTF8');

        //console.log(caminhoOriginal);
        //console.log(caminhoMelhor);
        console.log(caminhoGCC);

        //Gerar versão minified do Original
        var result = UglifyJS.minify(codigoOriginal, uglifyOptions);
        originalLoc = result.code.split(/\r\n|\r|\n/).length;
        originalChar = result.code.length;
        //Contar instruções
        var generatedAST = esprima.parse(result.code) as any;
        originalIns = CountNodes(generatedAST);

        tamanhoArquivoOriginalEmBytes = Buffer.byteLength(result.code, 'utf8');

        //Gerar versão minified do Melhor
        var resultMelhor = UglifyJS.minify(codigoMelhor, uglifyOptions);
        melhorLoc = resultMelhor.code.split(/\r\n|\r|\n/).length;
        melhorChar = resultMelhor.code.length;
        //Contar instruções
        var generatedASTMelhor = esprima.parse(resultMelhor.code) as any;
        melhorIns = CountNodes(generatedASTMelhor);

        tamanhoArquivoMelhorEmBytes = Buffer.byteLength(resultMelhor.code, 'utf8');

        //Gerar versão minified do GCC
        var resultGCC = UglifyJS.minify(codigoGCC, uglifyOptions);
        gccLoc = resultGCC.code.split(/\r\n|\r|\n/).length;
        gccChar = resultGCC.code.length;
        //Contar instruções
        var generatedASTGCC = esprima.parse(resultGCC.code) as any;
        gccIns = CountNodes(generatedASTGCC);

        tamanhoArquivoGCCEmBytes = Buffer.byteLength(resultGCC.code, 'utf8');

        resultados.push (`${library},${tamanhoArquivoOriginalEmBytes},${tamanhoArquivoMelhorEmBytes},${tamanhoArquivoGCCEmBytes},${originalChar},${melhorChar},${gccChar},${originalIns},${melhorIns},${gccIns}`);
        
    });

    EscreverResultadoEmCsv(DiretorioGcc, resultados, 'Resultados_GCC.csv');

    process.exit();
}

/** 
 * Salva os resultados na raiz
 */
function EscreverResultadoEmCsv(DiretorioResultados: string, listaResultados: TestResults[], nomeArquivoDestino: string) {

    var newLine: string = '\n';
    var csvcontent = "";
    
    listaResultados.forEach(linha => {
        csvcontent += linha + newLine;
    });

    var arquivoFinal = nomeArquivoDestino === undefined ? 'analise.csv' : nomeArquivoDestino;

    fs.writeFileSync(path.join(DiretorioResultados, arquivoFinal), csvcontent);
}

function getFilesizeInBytes(filename) {
    try {
        var stats = fs.statSync(filename)
        var fileSizeInBytes = stats.size    
    } catch (error) {
        console.log(`Erro ao ler o tamanho do arquivo ${filename}`);
    }
    
    return !fileSizeInBytes ? 0: fileSizeInBytes;
}

function CountNodes(AST: Object): number {
    var estraverse = require('estraverse');
    var total = 0;

    estraverse.traverse(AST, {
        enter: function (node) {
            if (node.type) {
                total += 1;
            }
        }
    });

    return total;
}

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}
