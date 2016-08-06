#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=10
#PBS -N Tempo-De-Execucao
### Request email when job begins and ends
#PBS -m bea
### Specify email address to use for notification.
#PBS -M ffarzat@cos.ufrj.br

date

### cd to directory where the job was submitted:
cd $PBS_O_WORKDIR

## node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/uuid lib/uuid.js /mnt/scratch/user8/Resultados/uuid 30

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/exectimer index.js /mnt/scratch/user8/Resultados/exectimer 30

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/minimist index.js /mnt/scratch/user8/Resultados/minimist 30

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/lodash lodash.js /mnt/scratch/user8/Resultados/lodash 30

date