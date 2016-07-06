#!/bin/bash
#PBS -l select=1:ncpus=48:mem=4gb
#PBS -l place=free
#PBS -N js-clients
#PBS -o clients-log.txt
#PBS -e clients-err.txt

set -x	#screen output

#cat - | env | grep PBS $@ | tee /mnt/scratch/user8/env-vars.txt
#cat - | node /mnt/scratch/user8/JavaScriptHeuristicOptmizer/build/src/Teste.js $@ | tee /mnt/scratch/user8/clients-log.txt

echo $PBS_O_WORKDIR

cd $PBS_O_WORKDIR

#node build/src/Teste.js
npm run build
node --expose-gc --max-old-space-size=102400 build/src/Sockets/runClients.js 
exit 0