var fs = require('fs');
var path = require('path');

var DiretorioDosResultados = process.argv[2].replace("'", "");
var FileResults = path.join(DiretorioDosResultados, "Results-grouped-all-heuristics.csv");
//====================================================================================//>
var ListaDasHeuristicasExt = getHeuristics(DiretorioDosResultados)
var runResult = "";
runResult += "Lib;alg;trial;time;chars;originalchars;diffchars \n";

ListaDasHeuristicasExt.forEach(localHeuristic => {
    var Diretorioheuristica = path.join(DiretorioDosResultados, localHeuristic);
    var filePath = `${Diretorioheuristica}/Results-grouped-all.csv`;

    if (fs.existsSync(filePath)) {
        var text = fs.readFileSync(filePath, 'utf8');

        if (text.length === 0) {
            console.log(`The file "${filePath}" is empty!`);
            process.exit(1);
        }

        var arr = text.split("\n");

        for (let index = 1; index < arr.length; index++) {
            var element = arr[index];
            if (localHeuristic === 'HC') {
                element = element.replace('HC', 'HC3');
            }
            runResult += element === '' ? '' : element + '\n';
        }
    }
    else {
        console.log(`The file "${filePath}" do not exists!`);
        process.exit(1);
    }

});

console.log(`Generated File: ${FileResults}`);

runResult = runResult.replace(/"/g, '');

fs.writeFileSync(FileResults, runResult);


//==================================================================
function getHeuristics(srcpath) {
    return ['RDs', 'HCs', 'HC'];
}


