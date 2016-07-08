/// <reference path="./typings/tsd.d.ts" />
//	node build/src/teste.js


var numCPUs = (require('os').cpus().length);
console.log(`[runClients] CPUS Available on host: ${numCPUs}`);


