#!/bin/bash
#PBS -l select=1:ncpus=48:mem=4gb
#PBS -l place=free
#PBS -N JavaScript
#PBS -o /mnt/scratch/user8/clients-log.txt
#PBS -e /mnt/scratch/user8/clients-err.txt

set -x	#screen output

#cat - | env | grep PBS $@ | tee /mnt/scratch/user8/env-vars.txt
#cat - | node /mnt/scratch/user8/JavaScriptHeuristicOptmizer/build/src/Teste.js $@ | tee /mnt/scratch/user8/clients-log.txt

node --expose-gc --max-old-space-size=102400 /mnt/scratch/user8/JavaScriptHeuristicOptmizer/build/src/Sockets/runClients.js 

exit 0