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

let songInfo = [];
async function getSongInfo(index) {
  let data = mdData[index];
  let searchString = `${data[2]} ${data[3]}`
    .replace(/\(.*\)/, '').replace('+', ' ').replace('  ', ' ');
  await axios.get('/search', { params: { keywords: searchString } })
    .then(val => {
      try {
        songInfo[index] = val.data.result.songs;
        console.log(`${index}: ${val.data.result.songs[0].name} succeeded`);
      } catch(err) {
        console.error(`${index}: ${searchString} error: ${err}`);
        writeLog(`${index}: ${searchString} error: ${err}`);
      }
    })
    .catch(err => {
      console.error(`${index}: ${searchString} error: ${err}`);
      writeLog(`${index}: ${searchString} error: ${err}`);
    });
}

async function getAllSong() {
  for(let i in mdData) {
    await getSongInfo(i);
  }
}

getAllSong().then(val => fs.writeFileSync(path.join(__dirname, '../data/songInfo.json'), JSON.stringify(songInfo)));

// let promises = mdData.map(data => {
//   let searchString = `${data[2]} ${data[3]}`
//     .replace(/\(.*\)/, '').replace('+', ' ').replace('  ', ' ');
//   return axios.get('/search', { params: { keywords: searchString } });
// });

// let ids = [];
// Promise.all(promises)
//   .then(responses => {
//     ids = responses.map(res => res.data.result.songs);
//     fs.writeFileSync(path.join(__dirname, '../data/songInfo.json'), JSON.stringify(ids));
//   })
//   .catch(reason => console.warn(reason));
