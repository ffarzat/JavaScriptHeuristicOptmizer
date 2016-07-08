#!/bin/bash
#PBS -k oe
#PBS -l select=10:ncpus=48:mem=16gb
#PBS -N GA-clients
### Request email when job begins and ends
#PBS -m bea
### Specify email address to use for notification.
#PBS -M ffarzat@cos.ufrj.br

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
### npm run PBS - o server já executa esse comando
node --expose-gc --max-old-space-size=102400 build/src/Sockets/runClients.js Configs/GA-Clients.json

date



