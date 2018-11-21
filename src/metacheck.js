const fs = require('fs');
const path = require('path');

let meta = fs.readFileSync(path.join(__dirname, '../data/meta/meta.json'), 'utf-8');
meta = JSON.parse(meta);
let result = {};

for(let i in meta) {
  try {
    function toDenseString(str) {
      str = str.toLowerCase();
      let result = '';
      for(let i = 0; i < str.length; i++) {
        if(str.charCodeAt(i) > 'a'.charCodeAt(0) && str.charCodeAt(i) < 'z'.charCodeAt(0)) {
          result += str.charAt(i);
        }
      }
      return result;
    }
    let ne = toDenseString(meta[i].neteaseName), sc = toDenseString(meta[i].soundcloudName);
    if(ne !== sc && !ne.includes(sc) && !sc.includes(ne)) {
      console.log(`${i}: ${meta[i].neteaseName} // ${meta[i].soundcloudName}`);
    } else {
      result[i] = meta[i];
    }
  } catch(err) {
    console.log(`${i}: ${err}`);
  }
}

fs.writeFileSync(path.join(__dirname, '../data/meta/meta-verified.json'), JSON.stringify(result));
