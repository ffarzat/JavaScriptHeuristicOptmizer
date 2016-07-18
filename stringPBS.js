var Libname = "xml2js";
var ConfigName = "xml2js/xml2js.json";
var DirectoryToSave = "xml2js";
//====================================================================================//>
var fs = require('fs');

for (var index = 0; index < 60; index++) {
    var result = "";
    result += "#!/bin/bash" + "\n";
    result += "#PBS -k oe" + "\n";
    result += "#PBS -l select=1:ncpus=48" + "\n";
    result += `#PBS -N ${Libname}` + "\n";
    result += "#PBS -m bea" + "\n";
    result += "#PBS -M ffarzat@cos.ufrj.br" + "\n";
    result += `node build/src/index.js ${ConfigName} null null ${index}\n` + "\n";

    if (!fs.existsSync(DirectoryToSave)) {
        fs.mkdirSync(DirectoryToSave);
    }

    fs.writeFileSync(`${DirectoryToSave}/xml2js-${index}.sh`, result);
}

