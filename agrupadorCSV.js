var Directory = "/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Estatica/pug/HC";
var FileResults = "Results-grouped.csv";
//====================================================================================//>
var fs = require('fs');
var runResult = "";
runResult += "sep=,\ntrial,originalIndividualAvgTime,originalIndividualLOC,originalIndividualCharacters,bestIndividualAvgTime,bestIndividualLOC,bestIndividualCharacters,time,better\n";

for (var index = 0; index < 30; index++) {

    var text = fs.readFileSync(`${Directory}/${index}-Results.csv`,'utf8');
    var arr = text.split("\n");  
    //console.log(arr[2]);
    
    runResult += `${arr[2]}\n`;
}

console.log(`Generated File: ${Directory}/${FileResults}`);

fs.writeFileSync(`${Directory}/${FileResults}`, runResult);
