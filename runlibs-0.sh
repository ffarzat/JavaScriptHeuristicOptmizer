
#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N pequenas-0
#PBS -l walltime=500:00:00
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"

node --max-old-space-size=2408000 build/src/index.js uuid/uuid.json null null 0
node --max-old-space-size=2408000 build/src/index.js xml2js/xml2js.json null null 0
node --max-old-space-size=2408000 build/src/index.js tleaf/tleaf.json null null 0
node --max-old-space-size=2408000 build/src/index.js plivo/plivo.json null null 0
node --max-old-space-size=2408000 build/src/index.js minimist/minimist.json null null 0
node --max-old-space-size=2408000 build/src/index.js exectimer/exectimer.json null null 0
node --max-old-space-size=2408000 build/src/index.js d3-node/d3-node.json null null 0

