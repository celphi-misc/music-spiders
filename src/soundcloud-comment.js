const fs = require('fs');
const path = require('path');
const axios = require('axios');

var start = 777;
var end = 1000;
var maxTries = 50;

// Meta
var meta = fs.readFileSync(path.join(__dirname, '../data/meta/meta-verified.json'), 'utf8');
meta = JSON.parse(meta);

// Clear log
const logFilename = path.join(__dirname, '../log/soundcloud-comments.log');
fs.writeFileSync(logFilename, '');
function writeLog(str) { fs.appendFileSync(logFilename, str + '\n'); }

// ShadowSocks proxy settings
axios.defaults.proxy = {
  host: '127.0.0.1',
  port: 1087
};
  
// Base URL
axios.defaults.baseURL = 'http://api.soundcloud.com';

// Default params, client id
axios.defaults.params = {
  client_id: 'LvWovRaJZlWCHql0bISuum8Bd2KX79mb'
};

async function getComments(id) {
  var comments = [];
  for(var i = 0; i < maxTries; i++) {
    try {
      var res = await axios.get(`/tracks/${id}`);
      break;
    } catch(err) {
      writeLog(`${new Date()}\tCannot get SC id ${id}`);
    }
  }
  if(i == maxTries) writeLog(`${new Date()}\tFAILURE: Max tries exceeded for NE id ${id}`);

  let count = res.data.comment_count;
  console.log(`Song ${id}: ${count} comments`);

  for(let i = 0; i * 200 < count; i++) {
    for(var j = 0; j < maxTries; j++) {
      try {
        let res = await axios.get(`/tracks/${id}/comments`, { params: { offset: i * 200 } });
        if(res.data) {
          res.data.forEach(comment => comments.push(comment));
          process.stdout.write(`\r${Math.ceil(i*20000/count)}%`);
          break;
        }
        else throw Error();
      } catch(err) {
        writeLog(`${new Date()}\tCannot get SC id ${id}`);
      }
    }
    if(j === maxTries) writeLog(`${new Date()}\tFAILURE: Max tries exceeded for NE id ${id}`);
  }
  return comments;
}

(async function() {
  let count = 0;
  let it = Object.keys(meta).filter(key => Number.parseInt(key) >= start && Number.parseInt(key) <= end);

  for(let id of it) {
    let song = meta[id];
    let comments = await getComments(song.soundcloudId);
    console.log(`\r${Math.ceil(Number.parseInt(id)/10)}% of all completed.`);
    fs.writeFileSync(path.join(__dirname, `../data/comments/soundcloud/id-${id}.json`), JSON.stringify(comments));
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
})();
