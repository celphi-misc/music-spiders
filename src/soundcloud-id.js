const fs = require('fs');
const path = require('path');
const axios = require('axios');
const CSVToArray = require('./CSVToArray');

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

const mdFile = fs.readFileSync(path.join(__dirname, '../data/metadata.csv'), 'utf8');
const mdData = CSVToArray(mdFile);
mdData.splice(0, 1);

// Clear log
const logFilename = path.join(__dirname, '../log/soundcloud-id.log');
fs.writeFileSync(logFilename, '');
function writeLog(str) { fs.appendFileSync(logFilename, str + '\n'); }

let songInfo = {};
async function getSongInfo(data) {
  let searchString = `${data[2]} ${data[3]}`
    .replace(/\(.*\)/, '').replace('+', ' ').replace('  ', ' ');
  await axios.get('/tracks', { params: { q: searchString } })
    .then(val => {
      try {
        songInfo[data[0]] = val.data;
        console.log(`${data[0]}: ${val.data[0].title} succeeded`);
      } catch(err) {
        console.error(`${data[0]}: ${searchString} error: ${err}`);
        writeLog(`${data[0]}: ${searchString} error: ${err}`);
      }
    })
    .catch(err => {
      console.error(`${data[0]}: ${searchString} error: ${err}`);
      writeLog(`${data[0]}: ${searchString} error: ${err}`);
    })
}

async function getAllSong() {
  for(let data of mdData) {
    await getSongInfo(data);
  }
}

getAllSong().then(val => fs.writeFileSync(path.join(__dirname, '../data/search-result/soundcloud.json'), JSON.stringify(songInfo)));