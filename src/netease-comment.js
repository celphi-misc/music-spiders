const fs = require('fs');
const path = require('path');
const axios = require('axios');

// NetEase music API base URL
axios.defaults.baseURL = 'http://localhost:3000';

var meta = fs.readFileSync(path.join(__dirname, '../data/meta/meta-verified.json'), 'utf8');
meta = JSON.parse(meta);

// Total: 645
// console.log(Object.keys(meta).length);

async function getComments(id) {
  var comments = [];
  let res = await axios.get('/comment/music', { params: { id, limit: 20, offset: 0 } });
  let data = res.data;
  let count = data.total;
  console.log(`Song ${id}: ${count} comments`);
  comments = data.comments.splice();
  await (async function () {
    for(let i = 1; i * 20 < count; i ++) {
      await axios.get('/comment/music', { params: {
        id, limit: 20, offset: i } })
          .then(res => {
            res.data.comments.forEach(comment => comments.push(comment));
          }).catch(err => console.err);
    }
  })();
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
    if(count >= 20) {
      fs.writeFileSync(path.join(__dirname, `../data/comments/netease/${count}.json`), JSON.stringify(buffer));
      count = 0;
      buffer = {};
    }
  }
  return buffer;
})();