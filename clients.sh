#!/bin/bash
#PBS -l select=1:ncpus=48:mem=4gb
#PBS -l place=free
#PBS -N JavaScript

set -x	#screen output
#cat - | env | grep PBS $@ | tee /mnt/scratch/user8/env-vars.txt
cat - | node --expose-gc --max-old-space-size=102400 build/src/Sockets/runClients.js $@ | tee /mnt/scratch/user8/clients-log.txt
#cat - | node /mnt/scratch/user8/JavaScriptHeuristicOptmizer/build/src/Teste.js $@ | tee /mnt/scratch/user8/clients-log.txt

exit 0