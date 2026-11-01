const { createClient } = require('./node_modules/@supabase/supabase-js');
const fs = require('fs');
const crypto = require('crypto');

const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const client = createClient(url, key);

function uuidFromText(text) {
  const hash = crypto.createHash('md5').update(text).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    '8' + hash.substring(17, 20),
    hash.substring(20, 32)
  ].join('-');
}

async function seed() {
  console.log('Reading leetcodeIndex.json...');
  const rawList = JSON.parse(fs.readFileSync('../src/data/leetcodeIndex.json', 'utf-8'));
  console.log(`Loaded ${rawList.length} problems. Preparing batch rows...`);

  const rows = rawList.map((item) => {
    const slug = item.slug.toLowerCase().trim();
    const id = uuidFromText(slug);
    const difficulty = (item.diff === 'Hard' || item.diff === 'Medium' ? item.diff : 'Easy');
    const pattern = item.topics && item.topics.length > 0 ? item.topics[0] : 'General Algorithm';

    return {
      id,
      problem_number: item.num,
      title: item.title,
      slug,
      difficulty,
      pattern,
      topics: item.topics || ['General'],
      leetcode_url: `https://leetcode.com/problems/${slug}/`
    };
  });

  const BATCH_SIZE = 500;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await client.from('problems').upsert(batch, { onConflict: 'slug' });
    if (error) {
      console.error(`Error upserting batch ${i} - ${i + batch.length}:`, error);
      process.exit(1);
    }
    console.log(`Upserted ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length} problems...`);
  }

  console.log('✅ Successfully synced all 2,913 problems into Supabase problems table!');
}

seed();

