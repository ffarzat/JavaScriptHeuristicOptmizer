#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -l walltime=500:00:00
#PBS -N Moment-10
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"
#node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 10

#node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 11

#node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 12

#node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 13

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 14

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 15

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 16

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 17

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 18

node --max-old-space-size=2408000 build/src/index.js Moment/moment.json null null 19