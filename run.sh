#!/bin/bash
#PBS -l select=1:ncpus=48
#PBS -N js-optmizer

set -x	#screen output
#cat - | node -v $@ | tee /mnt/scratch/user8/out.txt # test node
echo $PBS_O_WORKDIR
cd $PBS_O_WORKDIR
npm run PBS
node --expose-gc --max-old-space-size=102400 build/src/index.js &
sleep 1m
node --expose-gc --max-old-space-size=102400 build/src/Sockets/runClients.js 
exit 0