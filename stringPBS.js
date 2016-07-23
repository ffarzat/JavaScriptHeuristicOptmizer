var Libname = "Jquery";
var ConfigName = "Jquery/jquery.json";
var DirectoryToSave = "Jquery";
//====================================================================================//>
var fs = require('fs');
var runResult = "";
runResult += "#!/bin/bash" + "\n";

for (var index = 1; index < 60; index++) {

    var result = "";
    result += "#!/bin/bash" + "\n";
    result += "#PBS -k oe" + "\n";
    result += "#PBS -l select=1:ncpus=48" + "\n";
    result += `#PBS -N ${Libname}-${index}` + "\n";
    result += "#PBS -m bea" + "\n";
    result += "#PBS -M ffarzat@cos.ufrj.br" + "\n";
    result += "cd $PBS_O_WORKDIR" + "\n";
    result += 'echo "----------------"' + "\n";
    result += 'echo "PBS job running on: `hostname`"' + "\n";
    result += 'echo "in directory:       `pwd`"' + "\n";
    result += 'echo "nodes: $NPROCS"' + "\n";
    result += 'echo "----------------"' + "\n";
    result += `node --max-old-space-size=512000 build/src/index.js ${ConfigName} null null ${index}\n` + "\n";


    runResult += `qsub ${DirectoryToSave}/${Libname}-${index}.sh` + "\n";
    runResult += `sleep 1m` + "\n";


    if (!fs.existsSync(DirectoryToSave)) {
        fs.mkdirSync(DirectoryToSave);
    }

    fs.writeFileSync(`${DirectoryToSave}/${Libname}-${index}.sh`, result);
}

fs.writeFileSync(`${DirectoryToSave}/run.sh`, runResult);
