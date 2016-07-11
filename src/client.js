var os = require("os");
const child_process = require('child_process');

child_process.exec(`cd Libraries/uuid && npm test`);

console.log(`Tests ${process.argv[2]} executed inside host: ${os.hostname()}`);
