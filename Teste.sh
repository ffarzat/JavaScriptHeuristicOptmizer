#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48:mpiprocs=48:arch=linux
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
##echo "nodefile:"
##cat $PBS_NODEFILE
#NO_OF_CORES=`cat $PBS_NODEFILE | egrep -v '^#'\|'^$' | wc -l | awk '{print $1}'`
echo "----------------"

node --expose-gc --max-old-space-size=512000 build/src/Teste.js Configuration.json $NPROCS $PBS_NODEFILE

### mpirun -np 5 --map-by node --hostfile $PBS_NODEFILE echo $HOSTNAME && sleep 5 


### mpirun -np 48 --hostfile $PBS_NODEFILE node --expose-gc --max-old-space-size=102400 src/hosts.js $NPROCS $PBS_NODEFILE


### run the program (on the nodes as provided by PBS):

### for i in {1..96}
 ### do
    ### node --expose-gc --max-old-space-size=102400 src/hosts.js $NPROCS $PBS_NODEFILE 
### done

date



