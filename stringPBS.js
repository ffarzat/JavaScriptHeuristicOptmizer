var fs = require('fs');

var result = "";

for (var index = 4; index < 60; index++) {
    result += `qsub -N xml2js-${index} -l select=1:ncpus=48 -k oe -m bea -M ffarzat@cos.ufrj.br -- command node build/src/index.js Configuration/xml2js.json null null ${index}\n`;
}

fs.writeFileSync("xml2js.txt", result);