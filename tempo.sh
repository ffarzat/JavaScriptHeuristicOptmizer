#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=10
#PBS -N Tempo-De-Execucao
### Request email when job begins and ends
#PBS -m bea
### Specify email address to use for notification.
#PBS -M ffarzat@cos.ufrj.br

node build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/uuid lib/uuid.js /mnt/scratch/user8/Resultados/uuid 30