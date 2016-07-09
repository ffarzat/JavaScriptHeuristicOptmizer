#!/bin/bash
#PBS -k oe
#PBS -l select=3:ncpus=48:mpiprocs=48
#PBS -N Lodash
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
### echo "nodefile:"
### cat $PBS_NODEFILE
echo "----------------"

### run the program (on the nodes as provided by PBS):
npm run PBS
node --expose-gc --max-old-space-size=102400 build/src/index.js Configs/Lodash.json &
mpirun -np 142 node --expose-gc --max-old-space-size=102400 build/src/Sockets/runClients.js Configs/Lodash.json
date


