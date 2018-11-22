const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ==== Configurations ====
// Step: Create new file by this number of songs
var start = 5;
var step = 1;
var end = 1000;
var maxTries = 50;
var proxyList = [];
// NetEase music API base URL
axios.defaults.baseURL = 'http://localhost:3000';

async function getRandomProxy() {
  if(!proxyList.length) {
    try {
      let res = await axios.get('http://webapi.http.zhimacangku.com/getip?num=20&type=1&pro=&city=0&yys=0&port=1&time=1&ts=0&ys=0&cs=0&lb=4&sb=0&pb=45&mr=1&regions=');
      proxyList = res.data.split('\n').filter(str => str !== '');
      console.log(`New proxies got.`)
    } catch(err) {
      console.log(`${new Date()}\tFAILURE: Proxy request failed`);
    }
  }
  let index = Math.floor(Math.random() * proxyList.length);
  return 'http://' + proxyList[index];
}
function removeFromProxies(str) {
  let index = proxyList.indexOf(str.replace('http://', ''));
  if(index > 0) proxyList.splice(index, 1);
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
      proxy = await getRandomProxy();
      var res = await axios.get('/comment/music', { params: { id, limit: 20, offset: 0, proxy } });
      break;
    } catch(err) {
      writeLog(`${new Date()}\tCannot get NE id ${id} from ${proxy}`);
      removeFromProxies(proxy);
    }
  }
  if(i == maxTries) {
    writeLog(`${new Date()}\tFAILURE: Max tries exceeded for NE id ${id}`);
    removeFromProxies(proxy);
    return [];
  }
  let data = res.data;
  let count = data.total;
  console.log(`Song ${id}: ${count} comments, ${proxyList.length} proxies left`);
  comments = data.comments.splice();

  for(let i = 1; i * 20 < count; i ++) {
    for(var j = 0; j < maxTries; j++) {
      try {
        proxy = await getRandomProxy();
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
        removeFromProxies(proxy);
      }
    }
    if(j == maxTries) writeLog(`${new Date()}\tFAILURE: Max tries exceeded for NE id ${id}`);
  }
  return comments;
}

(async function() {
  let buffer = {};
  let count = 0;
  let it = Object.keys(meta).filter(key => Number.parseInt(key) >= start && Number.parseInt(key) <= end);
  
  for(let id of it) {
    let song = meta[id];
    let comments = await getComments(song.neteaseId);
    console.log(`\r${Math.ceil(Number.parseInt(id)/10)}% of all completed.`);
    buffer[id] = comments;
    count++;
    if(count >= step) {
      if(step === 1) var outFilename = `id-${id}.json`;
      else var outFilename = `${count}.json`;
      fs.writeFileSync(path.join(__dirname, `../data/comments/netease/${outFilename}`), JSON.stringify(buffer));
      count = 0;
      buffer = {};
      // await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return buffer;
})();
