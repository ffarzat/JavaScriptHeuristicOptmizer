#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N underscore-50
#PBS -l walltime=500:00:00
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"
node --max-old-space-size=2408000 build/src/index.js underscore/underscore.json null null 50

node --max-old-space-size=2408000 build/src/index.js underscore/underscore.json null null 51

node --max-old-space-size=2408000 build/src/index.js underscore/underscore.json null null 52

node --max-old-space-size=2408000 build/src/index.js underscore/underscore.json null null 53

node --max-old-space-size=2408000 build/src/index.js underscore/underscore.json null null 54

node --max-old-space-size=2408000 build/src/index.js underscore/underscore.json null null 55

node --max-old-space-size=2408000 build/src/index.js underscore/underscore.json null null 56

node --max-old-space-size=2408000 build/src/index.js underscore/underscore.json null null 57

node --max-old-space-size=2408000 build/src/index.js underscore/underscore.json null null 58

node --max-old-space-size=2408000 build/src/index.js underscore/underscore.json null null 59

