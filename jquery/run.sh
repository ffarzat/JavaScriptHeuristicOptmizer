#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N jquery-all
#PBS -l walltime=500:00:00
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "----------------"
echo "PBS job running on: `hostname`"
echo "in directory:       `pwd`"
echo "nodes: $NPROCS"
echo "----------------"
node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 0

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 1

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 2

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 3

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 4

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 5

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 6

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 7

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 8

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 9

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 10

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 11

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 12

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 13

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 14

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 15

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 16

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 17

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 18

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 19

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 20

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 21

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 22

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 23

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 24

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 25

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 26

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 27

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 28

node --max-old-space-size=2408000 build/src/index.js jquery/jquery.json null null 29