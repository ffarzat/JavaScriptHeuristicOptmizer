#!/bin/bash
#PBS -k oe
#PBS -l select=2:ncpus=48:mpiprocs=48:arch=linux
#PBS -N Testing
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
mpirun -np 96 --hostfile $PBS_NODEFILE /mnt/scratch/user8/nodev4/node --expose-gc --max-old-space-size=102400 src/hosts.js 

date


