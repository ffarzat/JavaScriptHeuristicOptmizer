window.minimist=function(c,g){function p(a,b){return e.g&&/^--[^=]+$/.test(b)||e.b[a]||e.a[a]||m[a]}function k(a,b,d){if(!d||!e.c||p(a,d)||!1!==e.c(d)){var c=!e.b[a]&&v(b)?Number(b):b;r(n,a.split("."),c);(m[a]||[]).forEach(function(a){r(n,a.split("."),c)})}}function r(a,b,d){var c=a;b.slice(0,-1).forEach(function(a){void 0===c[a]&&(c[a]={});c=c[a]});a=b[b.length-1];void 0===c[a]||e.a[a]||"boolean"===typeof c[a]?c[a]=d:Array.isArray(c[a])?c[a].push(d):c[a]=[c[a],d]}function w(a){return m[a].some(function(a){return e.a[a]})}
g||(g={});var e={a:{},b:{},c:null};"function"===typeof g.unknown&&(e.c=g.unknown);"boolean"===typeof g["boolean"]&&g["boolean"]?e.g=!0:[].concat(g["boolean"]).filter(Boolean).forEach(function(a){e.a[a]=!0});var m={};Object.keys(g.h||{}).forEach(function(a){m[a]=[].concat(g.h[a]);m[a].forEach(function(b){m[b]=[a].concat(m[a].filter(function(a){return b!==a}))})});[].concat(g.j).filter(Boolean).forEach(function(a){e.b[a]=!0;m[a]&&(e.b[m[a]]=!0)});var q=g["default"]||{},n={f:[]};Object.keys(e.a).forEach(function(a){k(a,
void 0===q[a]?!1:q[a])});var u=[];-1!==c.indexOf("--")&&(u=c.slice(c.indexOf("--")+1),c=c.slice(0,c.indexOf("--")));for(var h=0;h<c.length;h++){var d=c[h];if(/^--.+=/.test(d)){var f=d.match(/^--([^=]+)=([\s\S]*)$/),b=f[1];f=f[2];e.a[b]&&(f="false"!==f);k(b,f,d)}else if(/^--no-.+/.test(d))b=d.match(/^--no-(.+)/)[1],k(b,!1,d);else if(/^--.+/.test(d))b=d.match(/^--(.+)/)[1],f=c[h+1],void 0===f||/^-/.test(f)||e.a[b]||e.g||m[b]&&w(b)?/^(true|false)$/.test(f)?(k(b,"true"===f,d),h++):k(b,e.b[b]?"":!0,d):
(k(b,f,d),h++);else if(/^-[^-]+/.test(d)){b=d.slice(1,-1).split("");for(var t=!1,l=0;l<b.length;l++)if(f=d.slice(l+2),"-"===f)k(b[l],f,d);else{if(/[A-Za-z]/.test(b[l])&&/=/.test(f)){k(b[l],f.split("=")[1],d);t=!0;break}if(/[A-Za-z]/.test(b[l])&&/-?\d+(\.\d*)?(e-?\d+)?$/.test(f)){k(b[l],f,d);t=!0;break}if(b[l+1]&&b[l+1].match(/\W/)){k(b[l],d.slice(l+2),d);t=!0;break}else k(b[l],e.b[b[l]]?"":!0,d)}b=d.slice(-1)[0];t||"-"===b||(!c[h+1]||/^(-|--)[^-]/.test(c[h+1])||e.a[b]||m[b]&&w(b)?c[h+1]&&/true|false/.test(c[h+
1])?(k(b,"true"===c[h+1],d),h++):k(b,e.b[b]?"":!0,d):(k(b,c[h+1],d),h++))}else if(e.c&&!1===e.c(d)||n.f.push(e.b._||!v(d)?d:Number(d)),g.i){n.f.push.apply(n.f,c.slice(h+1));break}}Object.keys(q).forEach(function(a){x(n,a.split("."))||(r(n,a.split("."),q[a]),(m[a]||[]).forEach(function(b){r(n,b.split("."),q[a])}))});g["--"]?(n["--"]=[],u.forEach(function(a){n["--"].push(a)})):u.forEach(function(a){n.f.push(a)});return n};
function x(c,g){var p=c;g.slice(0,-1).forEach(function(c){p=p[c]||{}});return g[g.length-1]in p}function v(c){return"number"===typeof c||/^0x[0-9a-f]+$/i.test(c)?!0:/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(c)};