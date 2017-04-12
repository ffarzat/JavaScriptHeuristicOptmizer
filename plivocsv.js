var fs = require('fs');
var path = require('path');

var Libname = "plivo-node";
var arquivoEstatico = path.join(__dirname, `Libraries`, `${Libname}`, 'resultados-estatico.json');
var arquivoDinamico = path.join(__dirname, `Libraries`, `${Libname}`, 'resultados-dinamico.json');
var arquivoSaida = path.join(__dirname, `Libraries`, `${Libname}`, 'rankingAgrupado.csv');


var objetoEstatico = JSON.parse( fs.readFileSync(arquivoEstatico).toString());
var objetoDinamico = JSON.parse( fs.readFileSync(arquivoDinamico).toString());

var csv = `funcao;estatico;dinamico \n`;
for(var nome in objetoEstatico){
    var valorEstatico = objetoEstatico[nome] !== undefined ? objetoEstatico[nome] : 0;
    var valorDinamico = objetoDinamico[nome] !== undefined ? objetoDinamico[nome] : 0;
    csv +=`${nome}; ${valorEstatico}; ${valorDinamico} \n`;
}

fs.writeFileSync(arquivoSaida, csv)

