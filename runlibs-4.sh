#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N node-browserify-0
#PBS -l walltime=500:00:00
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"
node --max-old-space-size=2408000 build/src/index.js node-browserify/node-browserify.json null null 0

