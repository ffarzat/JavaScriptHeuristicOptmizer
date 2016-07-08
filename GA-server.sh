#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=2
#PBS -N GA-server
### Request email when job begins and ends
#PBS -m bea
### Specify email address to use for notification.
#PBS -M ffarzat@cos.ufrj.br
#output file
#PBS -o my_mpi_test.out

date

### cd to directory where the job was submitted:
cd $PBS_O_WORKDIR
echo $PBS_O_WORKDIR

### determine the number of allocated processors:
NPROCS=`wc -l < $PBS_NODEFILE`

echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "nodefile:"
cat $PBS_NODEFILE
echo "----------------"

### run the program (on the nodes as provided by PBS):
npm run PBS
node --expose-gc --max-old-space-size=102400 build/src/index.js Configs/GA-Server.json
date


