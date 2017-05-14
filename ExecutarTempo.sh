#!/bin/sh
#node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Dinamica/uuid' 30 20 'uuid'
#node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Estatica/uuid' 30 20 'uuid'

#node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Estatica/pug' 30 20 'pug'
#node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Dinamica/pug' 30 20 'pug'


#node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Estatica/minimist' 30 20 'minimist'
#node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Dinamica/minimist' 30 20 'minimist'


node build/src/GerarPlanilhaGlobal.js '/home/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/uuid' 30 1 'uuid'
node build/src/GerarPlanilhaGlobal.js '/home/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/exectimer' 30 1 'exectimer'
node build/src/GerarPlanilhaGlobal.js '/home/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/tleaf' 30 1 'tleaf'
node build/src/GerarPlanilhaGlobal.js '/home/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/plivo-node' 30 1 'plivo-node'
node build/src/GerarPlanilhaGlobal.js '/home/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/minimist' 30 1 'minimist'



node agrupadorCSVGlobal.js /home/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global
