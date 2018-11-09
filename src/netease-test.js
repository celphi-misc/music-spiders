const fs = require('fs');
const path = require('path');
const axios = require('axios');
const CSVToArray = require('./CSVToArray');

// NetEase music API base URL
axios.defaults.baseURL = 'http://localhost:3000';

const mdFile = fs.readFileSync(path.join(__dirname, '../data/metadata.csv'), 'utf8');
const mdData = CSVToArray(mdFile);
axios.get('/lyric?id=33894312')
    .then(res => {
        console.log(res.data);
    });
