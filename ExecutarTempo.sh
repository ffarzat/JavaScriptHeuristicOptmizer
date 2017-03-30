#!/bin/sh
node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Dinamica/uuid' 30 20 'uuid'
node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Estatica/uuid' 30 20 'uuid'

node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Estatica/pug' 30 20 'pug'
node build/src/AnaliseTempo.js '/home/fabio/Github/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Funcao Dinamica/pug' 30 20 'pug'
