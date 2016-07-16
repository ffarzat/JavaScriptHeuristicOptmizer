#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=10
#PBS -N Jade-50
### Request email when job begins and ends
#PBS -m bea
### Specify email address to use for notification.
#PBS -M ffarzat@cos.ufrj.br


date

### cd to directory where the job was submitted:
cd $PBS_O_WORKDIR

### determine the number of allocated processors:
NPROCS=`wc -l < $PBS_NODEFILE`

echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
### echo "nodefile:"
### cat $PBS_NODEFILE
#NO_OF_CORES=`cat $PBS_NODEFILE | egrep -v '^#'\|'^$' | wc -l | awk '{print $1}'`
echo "----------------"


### run the program (on the nodes as provided by PBS):
node --expose-gc --max-old-space-size=512000 build/src/index.js  Jade/jade-50.json 

date



