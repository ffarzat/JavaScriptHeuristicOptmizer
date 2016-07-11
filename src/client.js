var os = require("os");
const child_process = require('child_process');

child_process.exec(`sleep 30`);

console.log(`Tests ${process.argv[2]} executed inside host: ${os.hostname()}`);
