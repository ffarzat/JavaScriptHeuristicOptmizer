var fs = require('fs');
var path = require('path');


var DiretorioDosResultados = process.argv[2].replace("'", "");
var FileResults = path.join(DiretorioDosResultados, "Results-grouped-for-paper.csv");
//====================================================================================//>

var ListaDasBibliotecas = getDirectories(DiretorioDosResultados)
var runResult = "";
runResult += "Lib;alg;trial;origchars;originst;optchars;optinst;time\n";

ListaDasBibliotecas.forEach(function (biblioteca) {
    var arquivoBiblioteca = path.join(DiretorioDosResultados, biblioteca, "Resultados_paper.csv");
    var diretorioBiblioteca = path.join(DiretorioDosResultados, biblioteca);
    //var FileResultsBoxPlot = path.join(diretorioBiblioteca, "Results-grouped-Boxplot.paper.csv");

    //0-Lib; 1-Heuristic; 2-Trial; 3-Lines; 4- % Improved Loc; 5 - Chars; 6 - % Improved Chars; 7 -Instructions; 8 - % Improved Instructions; 9 -Time Spent
    var text = fs.readFileSync(arquivoBiblioteca, 'utf8');
    var arr = text.split("\n");

    originalCells = arr[1].split(";");
    //console.log(originalCells[1])

    for (var index = 2; index < arr.length - 1; index++) {
        var celulas = arr[index].split(";");
        runResult += `${celulas[0]};${celulas[1]};${celulas[2]};${originalCells[5]};${celulas[5]};${originalCells[7]};${celulas[7]};${celulas[9].toString().replace(',', '.')};\n`;       
    }

    /*
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
*/
    //console.log(`Generated File: ${FileResultsBoxPlot}`);

    //fs.writeFileSync(FileResultsBoxPlot, runResultBoxPlot);

}, this);

console.log(`Generated File: ${FileResults}`);

fs.writeFileSync(FileResults, runResult);


//==================================================================


function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory())
}
