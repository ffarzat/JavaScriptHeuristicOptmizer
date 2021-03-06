#!/bin/sh

# 2018 - https://github.com/google/closure-compiler https://www.npmjs.com/package/google-closure-compiler 
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/mathjs/lib/type/unit/Unit.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/mathjs.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/node-semver/semver.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/semver.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/express/lib/response.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/express.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/esprima/dist/esprima.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/esprima.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/moment/moment.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/moment.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/pug/packages/pug/lib/index.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/pug.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/jquery/dist/jquery.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/jquery.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/browserify/index.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/browserify.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid/lib/uuid.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/uuid.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer/index.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/exectimer.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf/src/ask.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/tleaf.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/d3-node/index.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/d3-node.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node/lib/plivo.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/plivo-node.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist/index.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/minimist.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/xml2js/lib/xml2js.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/xml2js.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/underscore/underscore.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/underscore.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/lodash/lodash.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/lodash.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/UglifyJS2/lib/compress.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/UglifyJS2.js
npx google-closure-compiler --js=/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/decimal.js/decimal.js --js_output_file=/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/closure-compiler/decimal.js


# 2018 - HC. HC4 e RDs - Agrupar tudo em um único csv

#Agrupa os resultados da lib em um unico arquivo (/lib/Results-grouped.csv)
#node agrupadorCSV.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC/
#node agrupadorCSV.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HCs/
#node agrupadorCSV.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/RDs/

#Agrupa os resultados da lib em um unico arquivo (/lib/Modifications-grouped.csv)
#node agrupadorModifications.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC/
#node agrupadorModifications.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HCs/
#node agrupadorModifications.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/RDs/
#Agrupa os resultados de todas as libs em um unico arquivo (/Hcs/Results-grouped-all.csv)
#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HCs/
#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC/
#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/RDs/

#node agrupadorTodasHeuristicas.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/


# 2018 - HC4 - Nova rodada com os nós novos. As libs estão separadas por pequenas e grandes

#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/mathjs/' '/lib/type/unit/Unit.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/mathjs' 10 1 'mathjs'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/node-semver/' 'semver.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/node-semver' 10 1 'node-semver'
##node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/express' 'lib/response.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/express' 10 1 'express'


#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/esprima/' 'dist/esprima.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/esprima' 10 1 'esprima'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/moment' 'moment.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/moment' 10 1 'moment'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/pug' 10 1 'pug'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/jquery' 'dist/jquery.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/jquery' 10 1 'jquery'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/browserify' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/node-browserify' 10 1 'browserify'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/uuid' 10 1 'uuid'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/exectimer' 10 1 'exectimer'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/tleaf' 10 1 'tleaf'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/d3-node' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/d3-node' 10 1 'd3-node'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/plivo-node' 10 1 'plivo-node'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/minimist' 10 1 'minimist'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/xml2js' 'lib/xml2js.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/xml2js' 10 1 'xml2js'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/underscore' 'underscore.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/underscore' 10 1 'underscore'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/lodash' 'lodash.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/lodash' 10 1 'lodash'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/UglifyJS2' 'lib/compress.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/UglifyJS2' 10 1 'UglifyJS2'

#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/
#node agrupadorCSVGlobal.paper.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/HC4/


#2018 - global 4 - bibliotecas em que alterei casos de teste para confirmar situações
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer_changed' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-4/exectimer_changed' 1 1 'exectimer_changed'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist_changed' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-4/minimist_changed' 1 1 'minimist_changed'

# node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-4/
# node agrupadorCSVGlobal.paper.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-4/

# #2018 - global-3 - nova lista de n[os global + Identifier e MemberExpression

# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/express' 'lib/response.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/express' 1 1 'express'

# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/esprima/' 'dist/esprima.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/esprima' 1 1 'esprima'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/moment' 'moment.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/moment' 1 1 'moment'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/pug' 1 1 'pug'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/jquery' 'dist/jquery.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/jquery' 1 1 'jquery'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/browserify' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/node-browserify' 1 1 'browserify'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/uuid' 1 1 'uuid'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/exectimer' 1 1 'exectimer'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/tleaf' 1 1 'tleaf'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/d3-node' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/d3-node' 1 1 'd3-node'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/plivo-node' 1 1 'plivo-node'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/minimist' 1 1 'minimist'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/xml2js' 'lib/xml2js.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/xml2js' 1 1 'xml2js'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/underscore' 'underscore.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/underscore' 1 1 'underscore'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/lodash' 'lodash.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/lodash' 1 1 'lodash'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/UglifyJS2' 'lib/compress.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/UglifyJS2' 1 1 'UglifyJS2'
# node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/
# node agrupadorCSVGlobal.paper.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-3/

#2018 - global-2 - nova lista de nós global

#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/mathjs/' '/lib/type/unit/Unit.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/mathjs' 1 1 'mathjs'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/node-semver/' 'semver.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/node-semver' 1 1 'node-semver'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/decimal.js/' 'decimal.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/decimal.js' 1 1 'decimal.js'

#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/esprima/' 'dist/esprima.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/esprima' 1 1 'esprima'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/moment' 'moment.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/moment' 1 1 'moment'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/pug' 1 1 'pug'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/jquery' 'dist/jquery.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/jquery' 1 1 'jquery'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/browserify' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/browserify' 1 1 'browserify'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/uuid' 1 1 'uuid'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/exectimer' 1 1 'exectimer'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/tleaf' 1 1 'tleaf'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/d3-node' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/d3-node' 1 1 'd3-node'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/plivo-node' 1 1 'plivo-node'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/minimist' 1 1 'minimist'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/xml2js' 'lib/xml2js.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/xml2js' 1 1 'xml2js'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/underscore' 'underscore.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/underscore' 1 1 'underscore'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/lodash' 'lodash.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/lodash' 30 1 'lodash'
# node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/UglifyJS2' 'lib/compress.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/UglifyJS2' 30 1 'UglifyJS2'
# node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/
# node agrupadorCSVGlobal.paper.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-2/


#2018 - global-1 - - Sem Identifier, MemberExpression e Literal

#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/esprima/' 'dist/esprima.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/esprima' 1 1 'esprima'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/moment' 'moment.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/moment' 1 1 'moment'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/pug' 1 1 'pug'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/jquery' 'dist/jquery.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/jquery' 1 1 'jquery'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/browserify' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/node-browserify' 1 1 'browserify'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/uuid' 1 1 'uuid'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/exectimer' 1 1 'exectimer'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/tleaf' 1 1 'tleaf'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/d3-node' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/d3-node' 1 1 'd3-node'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/plivo-node' 1 1 'plivo-node'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/minimist' 1 1 'minimist'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/xml2js' 'lib/xml2js.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/xml2js' 1 1 'xml2js'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/underscore' 'underscore.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/underscore' 1 1 'underscore'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/lodash' 'lodash.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/lodash' 30 1 'lodash'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/UglifyJS2' 'lib/compress.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/UglifyJS2' 30 1 'UglifyJS2'
#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/
#node agrupadorCSVGlobal.paper.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-1/


#2018 -global-0 - Sem Identifier e MemberExpression

#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/esprima/' 'dist/esprima.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/esprima' 30 1 'esprima'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/moment' 'moment.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/moment' 30 1 'moment'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/pug' 30 1 'pug'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/jquery' 'dist/jquery.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/jquery' 1 1 'jquery'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/browserify' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/node-browserify' 30 1 'browserify'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/uuid' 30 1 'uuid'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/exectimer' 30 1 'exectimer'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/tleaf' 30 1 'tleaf'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/d3-node' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/d3-node' 30 1 'd3-node'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/plivo-node' 30 1 'plivo-node'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/minimist' 30 1 'minimist'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/xml2js' 'lib/xml2js.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/xml2js' 30 1 'xml2js'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/underscore' 'underscore.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/underscore' 1 1 'underscore'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/lodash' 'lodash.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/lodash' 30 1 'lodash'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/UglifyJS2' 'lib/compress.js' '/home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/UglifyJS2' 30 1 'UglifyJS2'
#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/
#node agrupadorCSVGlobal.paper.js /home/fabio/Dropbox/Doutorado/2018/Experimentos/Fitness_Loc/global-0/





#-- Versões corretas
#-- https://github.com/pugjs/pug/releases/tag/pug%402.0.0-rc.1 
#-- https://github.com/jquery/jquery/releases/tag/3.2.1
#-- https://github.com/browserify/browserify/commit/6efcd65b07caef7c08aa00bb42f9fdb665c2e554
#-- https://github.com/jquery/esprima/commit/dea024fc158259ed513d78c1bb910ce847fd556c
#--
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/esprima/' 'dist/esprima.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/esprima' 30 1 'esprima'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/moment' 'moment.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/moment' 30 1 'moment'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/pug' 'packages/pug/lib/index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/pug' 30 1 'pug'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/browserify' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/node-browserify' 30 1 'browserify'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/uuid' 30 1 'uuid'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global//tleaf' 30 1 'tleaf'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/d3-node' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/d3-node' 30 1 'd3-node'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/plivo-node' 30 1 'plivo-node'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/minimist' 30 1 'minimist'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/xml2js' 'lib/xml2js.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/xml2js' 30 1 'xml2js'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/underscore' 'underscore.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/underscore' 30 1 'underscore'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/lodash' 'lodash.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/lodash' 30 1 'lodash'
#node build/src/GerarPlanilhaGlobal.paper.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/UglifyJS2' 'lib/compress.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/UglifyJS2' 30 1 'UglifyJS2'
#node agrupadorCSVGlobal.paper.js /home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Global/


#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Dinamico/uuid' 30 1 'uuid'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Dinamico/exectimer' 30 1 'exectimer'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Dinamico//tleaf' 30 1 'tleaf'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Dinamico/plivo-node' 30 1 'plivo-node'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Dinamico/minimist' 30 1 'minimist'

#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Dinamico/

#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Estatico/uuid' 30 1 'uuid'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Estatico/exectimer' 30 1 'exectimer'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Estatico//tleaf' 30 1 'tleaf'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Estatico/plivo-node' 30 1 'plivo-node'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Estatico/minimist' 30 1 'minimist'

#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_Loc_bytes/Resultados/Estatico/

#=====================================2016/2017

#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Dinamico/uuid' 30 1 'uuid'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Dinamico/exectimer' 30 1 'exectimer'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Dinamico//tleaf' 30 1 'tleaf'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Dinamico/plivo-node' 30 1 'plivo-node'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Dinamico/minimist' 30 1 'minimist'

#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Dinamico/

#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Estatico/uuid' 30 1 'uuid'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Estatico/exectimer' 30 1 'exectimer'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Estatico//tleaf' 30 1 'tleaf'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Estatico/plivo-node' 30 1 'plivo-node'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Estatico/minimist' 30 1 'minimist'

#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Estatico/


#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/uuid' 'lib/uuid.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/uuid' 30 1 'uuid'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/exectimer' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/exectimer' 30 1 'exectimer'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/express-ifttt-webhook' 'lib/webhook.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/express-ifttt-webhook' 30 1 'express-ifttt-webhook'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/gulp-ccr-browserify' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/gulp-cccr' 30 1 'gulp-cccr'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/jquery' 'dist/jquery.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/jquery' 30 1 'jquery'

#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/node-browserify' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/node-browserify' 30 1 'node-browserify'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/tleaf' 'src/ask.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global//tleaf' 30 1 'tleaf'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/plivo-node' 'lib/plivo.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/plivo-node' 30 1 'plivo-node'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/minimist' 'index.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/minimist' 30 1 'minimist'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/xml2js' 'lib/xml2js.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/xml2js' 30 1 'xml2js'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/underscore' 'underscore.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/underscore' 30 1 'underscore'
#node build/src/GerarPlanilhaGlobal.js '/home/fabio/Documents/JavaScriptHeuristicOptmizer/Libraries/lodash' 'lodash.js' '/home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/lodash' 30 1 'lodash'

#node agrupadorCSVGlobal.js /home/fabio/Dropbox/Doutorado/2017/Experimentos/Fitness_tempo_execucao/Resultados/Global/
