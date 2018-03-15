var fs = require('fs');
var path = require('path');

var Directory = process.argv[2].replace("'", "");
var FileResults = "Modifications-grouped.csv";
var ListaDasBibliotecas = getDirectories(Directory)
//====================================================================================//>
var fs = require('fs');

ListaDasBibliotecas.forEach(function (biblioteca) {
    var diretorioBiblioteca = path.join(Directory, biblioteca);
    var ListaDasHeuristicas = getDirectories(diretorioBiblioteca);
    ListaDasHeuristicas.forEach(function (heuristica) {

        var runResult = "";
        runResult += "trial;counter;index;instructionType;totalChars \n";

        for (var index = 0; index < 30; index++) {

            if (!fs.existsSync(`${diretorioBiblioteca}/${heuristica}/${index}_modifications.csv`))
                continue;

            var text = fs.readFileSync(`${diretorioBiblioteca}/${heuristica}/${index}_modifications.csv`, 'utf8');
            var arr = text.split("\n");

            if (!fs.existsSync(`${diretorioBiblioteca}/${heuristica}/${index}_modifications.csv`))
                continue;

            var text = fs.readFileSync(`${diretorioBiblioteca}/${heuristica}/${index}_modifications.csv`, 'utf8');

            if (text.length === 0)
                continue;

            var noHeadArr = arr.slice(1, arr.length);

            noHeadArr.forEach(line => {
                if (line.length > 0)
                    runResult += `${index};${line}\n`;
            });
        }

        console.log(`Generated File: ${diretorioBiblioteca}/${heuristica}/${FileResults}`);

        fs.writeFileSync(`${diretorioBiblioteca}/${heuristica}/${FileResults}`, runResult);
    });
});

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory())
}
