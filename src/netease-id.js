const fs = require('fs');
const path = require('path');
const axios = require('axios');
const CSVToArray = require('./CSVToArray');

// NetEase music API base URL
axios.defaults.baseURL = 'http://localhost:3000';

const mdFile = fs.readFileSync(path.join(__dirname, '../data/metadata.csv'), 'utf8');
const mdData = CSVToArray(mdFile);
mdData.splice(0, 1);

// Clear log
const logFilename = path.join(__dirname, '../log/netease-id.log');
fs.writeFileSync(logFilename, '');
function writeLog(str) { fs.appendFileSync(logFilename, str + '\n'); }

let songInfo = {};
async function getSongInfo(data) {
  let searchString = `${data[2]} ${data[3]}`
    .replace(/\(.*\)/, '').replace('+', ' ').replace('  ', ' ');
  
  await axios.get('/search', { params: { keywords: searchString } })
    .then(val => {
      try {
        songInfo[data[0]] = val.data.result.songs;
        console.log(`${data[0]}: ${val.data.result.songs[0].name} succeeded`);
      } catch(err) {
        console.error(`${data[0]}: ${searchString} error: ${err}`);
        writeLog(`${data[0]}: ${searchString} error: ${err}`);
      }
    })
    .catch(err => {
      console.error(`${data[0]}: ${searchString} error: ${err}`);
      writeLog(`${data[0]}: ${searchString} error: ${err}`);
    });
}

async function getAllSong() {
  for(let data of mdData) {
    await getSongInfo(data);
  }
}

getAllSong().then(val => fs.writeFileSync(path.join(__dirname, '../data/search-result/netease.json'), JSON.stringify(songInfo)));
