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

        if (!fs.existsSync(`${diretorioBiblioteca}/${heuristica}/Results-grouped.csv`)) {

            for (var index = 0; index < 30; index++) {
                if (!fs.existsSync(`${diretorioBiblioteca}/${heuristica}/${index}-Results.csv`))
                    continue;

                var text = fs.readFileSync(`${diretorioBiblioteca}/${heuristica}/${index}-Results.csv`, 'utf8');
                runResult += accumulateText(text, biblioteca, heuristica);
            }
        }
        else {
            var text = fs.readFileSync(`${diretorioBiblioteca}/${heuristica}/Results-grouped.csv`, 'utf8');
            runResult += accumulateText(text, biblioteca, heuristica);
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


function accumulateText(text, biblioteca, heuristica) {
    if (!text.length === 0)
        return '';

    var arr = text.split("\n");
    var returnedText = '';
    var indexLocal = 1; //pule uma linha (Header)

    if (!arr[0] || arr[0] == 'sep=,') {
        if (!arr[2] || arr[2].length === 0) {
            return '';
        }

        indexLocal = 2; //pule duas linhas (sep= e Header)
    }
    else {
        if (!arr[1] || arr[1].length === 0) {
            return '';
        }
    }

    for (let index = indexLocal; index < arr.length - 1; index++) {
        const element = arr[index];
        if (element.length == 0)
            return '';

        var separator = false;
        var itens = element.split(',');

        if (itens.length < 3) {
            itens = element.split(';');
            separator = true;
        }

        var totalDiff = parseFloat(itens[3]) - parseFloat(itens[6]);

        var time = itens[7] + '.' + itens[8];

        if (separator) {
            time = itens[7];
        }

        returnedText += `${biblioteca};${heuristica};${itens[0]};${time};${itens[6]};${itens[3]};${totalDiff} \n`
    }

    return returnedText;
}

