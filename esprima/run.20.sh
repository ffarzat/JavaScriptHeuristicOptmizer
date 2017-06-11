#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N esprima-20
#PBS -l walltime=500:00:00
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"
node --max-old-space-size=2408000 build/src/index.js esprima/esprima.json null null 20

node --max-old-space-size=2408000 build/src/index.js esprima/esprima.json null null 21

node --max-old-space-size=2408000 build/src/index.js esprima/esprima.json null null 22

node --max-old-space-size=2408000 build/src/index.js esprima/esprima.json null null 23

node --max-old-space-size=2408000 build/src/index.js esprima/esprima.json null null 24

node --max-old-space-size=2408000 build/src/index.js esprima/esprima.json null null 25

node --max-old-space-size=2408000 build/src/index.js esprima/esprima.json null null 26

node --max-old-space-size=2408000 build/src/index.js esprima/esprima.json null null 27

node --max-old-space-size=2408000 build/src/index.js esprima/esprima.json null null 28

node --max-old-space-size=2408000 build/src/index.js esprima/esprima.json null null 29