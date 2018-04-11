var fs = require('fs');
var path = require('path');

var DiretorioDosResultados = process.argv[2].replace("'", "");
var FileResults = path.join(DiretorioDosResultados, "Results-grouped-all.csv");
//====================================================================================//>
var ListaDasBibliotecas = getDirectories(DiretorioDosResultados)
var runResult = "";
runResult += "Lib;alg;trial;time;chars;originalchars;diffchars \n";

ListaDasBibliotecas.forEach(function (biblioteca) {
    var diretorioBiblioteca = path.join(DiretorioDosResultados, biblioteca);
    var ListaDasHeuristicas = getDirectories(diretorioBiblioteca);
    ListaDasHeuristicas.forEach(function (heuristica) {

        for (var index = 0; index < 30; index++) {

            if (!fs.existsSync(`${diretorioBiblioteca}/${heuristica}/${index}-Results.csv`))
                continue;

            var text = fs.readFileSync(`${diretorioBiblioteca}/${heuristica}/${index}-Results.csv`, 'utf8');

            if (text.length === 0)
                continue;

            var arr = text.split("\n");

            if (!arr[0] || arr[0] == 'sep=,') {
                if (!arr[2] || arr[2].length === 0) {
                    continue;
                }
                var itens = arr[2].split(',');
                var totalDiff = parseFloat(itens[3]) - parseFloat(itens[6]);
                runResult += `${biblioteca};${heuristica};${itens[0]};${itens[7]}.${itens[8]};${itens[6]};${itens[3]};${totalDiff} \n`;
            }
            else {
                if (!arr[1] || arr[1].length === 0) {
                    continue;
                }
                var itens = arr[1].split(',');
                var totalDiff = parseFloat(itens[3]) - parseFloat(itens[6]);
                runResult += `${biblioteca};${heuristica};${itens[0]};${itens[7]}.${itens[8]};${itens[6]};${itens[3]};${totalDiff} \n`;
            }
        }
    });
});

console.log(`Generated File: ${FileResults}`);

runResult = runResult.replace(/"/g, '');

fs.writeFileSync(FileResults, runResult);


//==================================================================


function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory())
}
