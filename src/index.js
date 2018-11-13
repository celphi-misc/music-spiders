const path = require('path');
const process = require('child_process');

const scriptName = './netease-id.js';

// Run command
let api = process.fork(path.join(__dirname, '../node_modules/NeteaseCloudMusicApi/app.js'), [], { silent: true });
setTimeout(() => process.fork(path.join(__dirname, scriptName)).on('close', () => api.kill('SIGKILL')), 500);
