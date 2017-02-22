#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N pug-30
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"

node --max-old-space-size=2408000 build/src/index.js pug/pug.json null null 30

node --max-old-space-size=2408000 build/src/index.js pug/pug.json null null 31

node --max-old-space-size=2408000 build/src/index.js pug/pug.json null null 32

node --max-old-space-size=2408000 build/src/index.js pug/pug.json null null 33

node --max-old-space-size=2408000 build/src/index.js pug/pug.json null null 34

node --max-old-space-size=2408000 build/src/index.js pug/pug.json null null 35

node --max-old-space-size=2408000 build/src/index.js pug/pug.json null null 36

node --max-old-space-size=2408000 build/src/index.js pug/pug.json null null 37

node --max-old-space-size=2408000 build/src/index.js pug/pug.json null null 38

node --max-old-space-size=2408000 build/src/index.js pug/pug.json null null 39