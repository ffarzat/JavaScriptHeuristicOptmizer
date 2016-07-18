#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N xml2js
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
node build/src/index.js xml2js/xml2js.json null null 36

