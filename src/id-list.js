const fs = require('fs');
const path = require('path');

const netease = fs.readFileSync(path.join(__dirname, '../data/search-result/netease.json'), 'utf8');

