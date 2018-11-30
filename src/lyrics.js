const fs = require('fs');
const path = require('path');
const axios = require('axios');

// NetEase music API base URL
axios.defaults.baseURL = 'http://localhost:3000';

// Meta
var meta = fs.readFileSync(path.join(__dirname, '../data/meta/meta.json'), 'utf8');
meta = JSON.parse(meta);

async function getLyrics(id) {
  let res = await axios.get('/lyric', { params: { id } });
  console.log(`${id} got lyrics`);
  try {
    return res.data.lrc.lyric;
  } catch(err) {
    console.log(`res.data: ${res.data}`);
  }
}

(async function() {
  let it = Object.keys(meta);

  for(id of it) {
    let song = meta[id];
    let lyrics = await getLyrics(song.neteaseId);
    console.log(`${id/10}% done.`);
    if(lyrics) fs.writeFileSync(path.join(__dirname, `../data/lyrics/${id}.lrc`), lyrics);
    await new Promise(resolve => setTimeout(resolve, 1500 * Math.random()));
  }
})();