var Libname = "Moment";
var ConfigName = "Configuration/moment.json";
var DirectoryToSave = "Moment";
//====================================================================================//>
var fs = require('fs');
//var runResult = "";
//runResult += "#!/bin/bash" + "\n";

var result = "";
result += "#!/bin/bash" + "\n";
result += "#PBS -k oe" + "\n";
result += "#PBS -l select=1:ncpus=48" + "\n";
result += `#PBS -N ${Libname}` + "\n";
result += "#PBS -m bea" + "\n";
result += "#PBS -M ffarzat@cos.ufrj.br" + "\n";
result += "cd $PBS_O_WORKDIR" + "\n";
result += 'echo "----------------"' + "\n";
result += 'echo "PBS job running on: `hostname`"' + "\n";
result += 'echo "in directory:       `pwd`"' + "\n";
result += 'echo "nodes: $NPROCS"' + "\n";
result += 'echo "----------------"' + "\n";

for (var index = 0; index < 60; index++) {

    result += `node --max-old-space-size=2408000 build/src/index.js ${ConfigName} null null ${index}\n` + "\n";

    if (!fs.existsSync(DirectoryToSave)) {
        fs.mkdirSync(DirectoryToSave);
    }

    //fs.writeFileSync(`${DirectoryToSave}/${Libname}-${index}.sh`, result);
}

fs.writeFileSync(`${DirectoryToSave}/run.sh`, result);
