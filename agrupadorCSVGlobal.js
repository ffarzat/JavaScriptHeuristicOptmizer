var fs = require('fs');
var path = require('path');


var DiretorioDosResultados = process.argv[2].replace("'", "");
var FileResults = path.join(DiretorioDosResultados, "Results-grouped.csv");
//====================================================================================//>

var ListaDasBibliotecas = getDirectories(DiretorioDosResultados)
var runResult = "";
runResult += "Lib;Heuristic;Trial;Lines;% Improved Loc;Chars;% Improved Chars;Time Spent\n";

ListaDasBibliotecas.forEach(function (biblioteca) {
    var arquivoBiblioteca = path.join(DiretorioDosResultados, biblioteca, "analiseTempoExecucao.csv");

    var text = fs.readFileSync(arquivoBiblioteca, 'utf8');
    var arr = text.split("\n");

    for (var index = 1; index < arr.length - 1; index++) {
        runResult += `${arr[index]}\n`;
    }

}, this);

console.log(`Generated File: ${FileResults}`);

fs.writeFileSync(FileResults, runResult);


//==================================================================


function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory())
}
