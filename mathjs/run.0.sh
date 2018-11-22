#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N mathjs-0
#PBS -l walltime=500:00:00
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"
node --max-old-space-size=2408000 build/src/index.js mathjs/mathjs.json null null 0

#node --max-old-space-size=2408000 build/src/index.js mathjs/mathjs.json null null 1

#node --max-old-space-size=2408000 build/src/index.js mathjs/mathjs.json null null 2

#node --max-old-space-size=2408000 build/src/index.js mathjs/mathjs.json null null 3

#node --max-old-space-size=2408000 build/src/index.js mathjs/mathjs.json null null 4

#node --max-old-space-size=2408000 build/src/index.js mathjs/mathjs.json null null 5

#node --max-old-space-size=2408000 build/src/index.js mathjs/mathjs.json null null 6

#node --max-old-space-size=2408000 build/src/index.js mathjs/mathjs.json null null 7

#node --max-old-space-size=2408000 build/src/index.js mathjs/mathjs.json null null 8

#node --max-old-space-size=2408000 build/src/index.js mathjs/mathjs.json null null 9