var fs = require('fs');
var path = require('path');

var Directory = process.argv[2].replace("'", "");
var FileResults = "Results-grouped.csv";
var ListaDasBibliotecas = getDirectories(Directory)
//====================================================================================//>
var fs = require('fs');

ListaDasBibliotecas.forEach(function (biblioteca) {
    var diretorioBiblioteca = path.join(Directory, biblioteca);
    var ListaDasHeuristicas = getDirectories(diretorioBiblioteca);
    ListaDasHeuristicas.forEach(function (heuristica) {

        var runResult = "";
        runResult += "trial,originalIndividualAvgTime,originalIndividualLOC,originalIndividualCharacters,bestIndividualAvgTime,bestIndividualLOC,bestIndividualCharacters,time,better\n";

        for (var index = 0; index < 30; index++) {

            if (!fs.existsSync(`${diretorioBiblioteca}/${heuristica}/${index}-Results.csv`))
                continue;

            var text = fs.readFileSync(`${diretorioBiblioteca}/${heuristica}/${index}-Results.csv`, 'utf8');
            var arr = text.split("\n");

            if (!fs.existsSync(`${diretorioBiblioteca}/${heuristica}/${index}-Results.csv`))
                continue;

            var text = fs.readFileSync(`${diretorioBiblioteca}/${heuristica}/${index}-Results.csv`, 'utf8');

            if (text.length === 0)
                continue;

                if (!arr[0] || arr[0] == 'sep=,') {
                if (!arr[2] || arr[2].length === 0) {
                    continue;
                }
                
                runResult += `${arr[2]}\n`;
            }
            else {
                if (!arr[1] || arr[1].length === 0) {
                    continue;
                }
                runResult += `${arr[1]}\n`;
            }
        }

        console.log(`Generated File: ${diretorioBiblioteca}/${heuristica}/${FileResults}`);

        fs.writeFileSync(`${diretorioBiblioteca}/${heuristica}/${FileResults}`, runResult);
    });
});

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory())
}
