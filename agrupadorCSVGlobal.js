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
    var diretorioBiblioteca = path.join(DiretorioDosResultados, biblioteca);
    var FileResultsBoxPlot = path.join(diretorioBiblioteca, "Results-grouped-Boxplot.csv");

    var text = fs.readFileSync(arquivoBiblioteca, 'utf8');
    var arr = text.split("\n");

    for (var index = 1; index < arr.length - 1; index++) {
        runResult += `${arr[index]}\n`;
    }

    var ListaDasHeuristicas = getDirectories(diretorioBiblioteca);
    var runResultBoxPlot = "heuristic,trial,originalIndividualAvgTime,originalIndividualLOC,originalIndividualCharacters,bestIndividualAvgTime,bestIndividualLOC,bestIndividualCharacters,time,better\n";
    ListaDasHeuristicas.forEach(function (heuristica) {

        for (var index = 0; index < 30; index++) {

            if (!fs.existsSync(`${diretorioBiblioteca}/${heuristica}/${index}-Results.csv`))
                continue;

            var text = fs.readFileSync(`${diretorioBiblioteca}/${heuristica}/${index}-Results.csv`, 'utf8');

            if (text.length === 0)
                continue;

            var arr = text.split("\n");

            if (arr[2] && arr[2].length === 0)
                continue;

            runResultBoxPlot += `${heuristica},${arr[2]}\n`;
        }

        //para libs antigas
        if (fs.existsSync(`${diretorioBiblioteca}/${heuristica}/Results.csv`)) {
            var text = fs.readFileSync(`${diretorioBiblioteca}/${heuristica}/Results.csv`, 'utf8');

            if (text.length > 0) {
                var arr = text.split("\n"); //30 ou 60 linhas

                for (var index = 1; index < arr.length; index++) {
                    var element = arr[index]; //linha
                    runResultBoxPlot += `${heuristica},${element}\n`;
                }
            }
        }
    });

    console.log(`Generated File: ${FileResultsBoxPlot}`);

    fs.writeFileSync(FileResultsBoxPlot, runResultBoxPlot);

}, this);

console.log(`Generated File: ${FileResults}`);

fs.writeFileSync(FileResults, runResult);


//==================================================================


function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory())
}
