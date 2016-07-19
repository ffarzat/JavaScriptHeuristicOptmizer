#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N Underscore-25
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"
node --max-old-space-size=512000 build/src/index.js Underscore/Underscore.json null null 25

