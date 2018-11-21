const fs = require('fs');
const path = require('path');

let netease = fs.readFileSync(path.join(__dirname, '../data/search-result/netease.json'), 'utf8');
let soundcloud = fs.readFileSync(path.join(__dirname, '../data/search-result/soundcloud.json'), 'utf8');
netease = JSON.parse(netease);
soundcloud = JSON.parse(soundcloud);

var result = {};

for(let i in netease) {
  if(!result[i]) result[i] = {};
  result[i].neteaseId = netease[i][0].id;
  result[i].neteaseName = netease[i][0].name;
  result[i].artists = netease[i][0].artists.map(item => item.name);
  result[i].neteaseDuration = netease[i][0].duration;
}

for(let i in soundcloud) {
  if(!result[i]) result[i] = {};
  result[i].soundcloudId = soundcloud[i][0].id;
  result[i].soundcloudName = soundcloud[i][0].title;
  result[i].soundcloudDuration = soundcloud[i][0].duration;
  result[i].bpm = soundcloud[i][0].bpm;
  result[i].genre = soundcloud[i][0].genre;
  result[i].scCommentCount = soundcloud[i][0].comment_count;
  result[i].scDownloadCount = soundcloud[i][0].download_count;
  result[i].scCommentable = soundcloud[i][0].commentable;
  result[i].scDownloadable = soundcloud[i][0].downloadable;
  result[i].scLikeCount = soundcloud[i][0].likes_count;
}

fs.writeFileSync(path.join(__dirname, '../data/meta/meta.json'), JSON.stringify(result));
