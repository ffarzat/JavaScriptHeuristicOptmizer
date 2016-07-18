#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N xml2js-18
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
node /mnt/scratch/user8/MomentTrials/JavaScriptHeuristicOptmizer/build/src/index.js xml2js/xml2js.json null null 18

