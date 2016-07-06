#!/bin/bash
#PBS -l select=1:ncpus=2
#PBS -N js-server

set -x	#screen output
#cat - | node -v $@ | tee /mnt/scratch/user8/out.txt # test node
#cat - | npm 	$@ | tee /mnt/scratch/user8/out.txt # test npm
#cat - | git 	$@ | tee /mnt/scratch/user8/out.txt # test npm

echo $PBS_O_WORKDIR
cd $PBS_O_WORKDIR
npm run build
node --expose-gc --max-old-space-size=102400 build/src/index.js
exit 0