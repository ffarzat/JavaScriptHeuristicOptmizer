#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N Tleaf-30
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"
node --max-old-space-size=512000 build/src/index.js Tleaf/tleaf.json null null 30

