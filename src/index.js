const path = require('path');
const process = require('child_process');

const scriptName = './netease-test.js';

// Run command
let api = process.fork(path.join(__dirname, '../node_modules/NeteaseCloudMusicApi/app.js'));
setTimeout(() => process.fork(path.join(__dirname, scriptName)).on('close', () => api.kill('SIGKILL')), 500);
