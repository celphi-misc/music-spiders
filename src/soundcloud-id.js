const fs = require('fs');
const path = require('path');
const axios = require('axios');

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


axios.get('/tracks', { params: { q: 'you belong with me' } })
  .then(val => fs.writeFileSync(path.join(__dirname, '../data/sc-track-sample.json'), JSON.stringify(val.data)));
