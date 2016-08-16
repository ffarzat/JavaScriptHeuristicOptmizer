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

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/jquery dist/jquery.js /mnt/scratch/user8/Resultados/jquery 60

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/uuid lib/uuid.js /mnt/scratch/user8/Resultados/uuid 60

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/exectimer index.js /mnt/scratch/user8/Resultados/exectimer 60

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/minimist index.js /mnt/scratch/user8/Resultados/minimist 60

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/lodash lodash.js /mnt/scratch/user8/Resultados/lodash 60

## node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/express-ifttt-webhook lib/webhook.js /mnt/scratch/user8/Resultados/express-ifttt-webhook 30

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/gulp-ccr-browserify index.js /mnt/scratch/user8/Resultados/gulp-cccr 60

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/Jade lib/index.js /mnt/scratch/user8/Resultados/Jade 60

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/node-browserify index.js /mnt/scratch/user8/Resultados/node-browserify 60

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/plivo-node lib/plivo.js /mnt/scratch/user8/Resultados/plivo-node 60

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/tleaf src/parse.js /mnt/scratch/user8/Resultados/tleaf 60

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/underscore underscore.js /mnt/scratch/user8/Resultados/underscore 60

node --max-old-space-size=512000 build/src/AnaliseTempo.js /mnt/scratch/user8/JavaScriptHeuristicOptmizer/Libraries/xml2js lib/xml2js.js /mnt/scratch/user8/Resultados/xml2js 60



date