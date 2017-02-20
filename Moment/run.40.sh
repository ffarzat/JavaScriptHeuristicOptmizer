#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N Lodash-40
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"
node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 40

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 41

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 42

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 43

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 44

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 45

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 46

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 47

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 48

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 49