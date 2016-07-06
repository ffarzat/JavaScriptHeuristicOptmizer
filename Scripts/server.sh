#!/bin/bash
#PBS -l select=1:ncpus=1:mem=1gb:mpiprocs=4
#PBS -N JavaScript
#PBS -p 1023



set -x	#screen output
#cat - | node -v $@ | tee /mnt/scratch/user8/out.txt # test node
#cat - | npm 	$@ | tee /mnt/scratch/user8/out.txt # test npm
#cat - | git 	$@ | tee /mnt/scratch/user8/out.txt # test npm

cd JavaScriptHeuristicOptmizer
cat - | node --expose-gc --max-old-space-size=102400 build/src/index.js $@ | tee /mnt/scratch/user8/server.txt

exit 0