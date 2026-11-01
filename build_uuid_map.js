const fs = require('fs');
const crypto = require('crypto');

const rawList = JSON.parse(fs.readFileSync('src/data/leetcodeIndex.json', 'utf-8'));

function uuidFromText(text) {
  const hash = crypto.createHash('md5').update(text.toLowerCase().trim()).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    '8' + hash.substring(17, 20),
    hash.substring(20, 32)
  ].join('-');
}

const map = {};
rawList.forEach((item) => {
  const slug = item.slug.toLowerCase().trim();
  map[slug] = uuidFromText(slug);
});

fs.writeFileSync('src/data/problemUuidMap.json', JSON.stringify(map));
console.log('Successfully wrote src/data/problemUuidMap.json with', Object.keys(map).length, 'entries');
