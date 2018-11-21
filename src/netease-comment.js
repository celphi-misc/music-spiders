const fs = require('fs');
const path = require('path');
const axios = require('axios');
const proxyList = require('./evil/proxyList');

// ==== Configurations ====
// Step: Create new file by this number of songs
var step = 1;
var maxTries = 50;
// NetEase music API base URL
axios.defaults.baseURL = 'http://localhost:3000';


function getRandomProxy() {
  let index = Math.floor(Math.random() * proxyList.length);
  return 'http://' + proxyList[index];
}

// Meta
var meta = fs.readFileSync(path.join(__dirname, '../data/meta/meta-verified.json'), 'utf8');
meta = JSON.parse(meta);

// Clear log
const logFilename = path.join(__dirname, '../log/netease-comments.log');
fs.writeFileSync(logFilename, '');
function writeLog(str) { fs.appendFileSync(logFilename, str + '\n'); }


// Total: 645
// console.log(Object.keys(meta).length);

async function getComments(id) {
  var comments = [];
  var proxy;
  for(var i = 0; i < maxTries; i++) {
    try {
      proxy = getRandomProxy(); 
      var res = await axios.get('/comment/music', { params: { id, limit: 20, offset: 0, proxy } });
      break;
    } catch(err) {
      writeLog(`${new Date()}\tCannot get NE id ${id} from ${proxy}`);
    }
  }
  if(i == maxTries) {
    writeLog(`${new Date()}\tFAILURE: Max tries exceeded for NE id ${id}`);
    return [];
  }
  let data = res.data;
  let count = data.total;
  console.log(`Song ${id}: ${count} comments`);
  comments = data.comments.splice();

  for(let i = 1; i * 20 < count; i ++) {
    for(var j = 0; j < maxTries; j++) {
      try {
        proxy = getRandomProxy();
        let res = await axios.get('/comment/music', { params: {
          id, limit: 20, offset: i, proxy } });
        if(res.data.comments) {
          res.data.comments.forEach(comment => comments.push(comment));
          process.stdout.write(`\r${Math.ceil(i*20/count*100)}%`);
          break;
        }
        else throw Error();
      } catch(err) {
        writeLog(`${new Date()}\tCannot get NE id ${id} from ${proxy}`);
      }
    }
    if(j == maxTries) writeLog(`${new Date()}\tFAILURE: Max tries exceeded for NE id ${id}`);
  }
  return comments;
}

(async function() {
  let buffer = {};
  let count = 0;
  for(let id in meta) {
    let song = meta[id];
    let comments = await getComments(song.neteaseId);
    console.log(`${Math.ceil(Number.parseInt(id)/10)}%`);
    buffer[id] = comments;
    count++;
    if(count >= step) {
      if(step === 1) var outFilename = `id-${id}.json`;
      else var outFilename = `${count}.json`;
      fs.writeFileSync(path.join(__dirname, `../data/comments/netease/${outFilename}`), JSON.stringify(buffer));
      count = 0;
      buffer = {};
      // await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return buffer;
})();
