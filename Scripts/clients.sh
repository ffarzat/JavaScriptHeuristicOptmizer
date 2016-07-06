#!/bin/bash
#PBS -l select=4:ncpus=48:mem=2gb
#PBS -l place=free
#PBS -N JavaScript
#PBS -p 1023


set -x	#screen output
#cat - | node -v $@ | tee /mnt/scratch/user8/out.txt # test node
#cat - | npm 	$@ | tee /mnt/scratch/user8/out.txt # test npm
#cat - | git 	$@ | tee /mnt/scratch/user8/out.txt # test npm

cd JavaScriptHeuristicOptmizer
#cat - | node --expose-gc --max-old-space-size=102400 build/src/Sockets/runClients.js $@ | tee /mnt/scratch/user8/clients.txt

cat - | env | grep PBS $@ | tee /mnt/scratch/user8/clients.txt


exit 0