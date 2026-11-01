const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('backend/.env', 'utf-8');
const url = env.match(/SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const client = createClient(url, key);

async function test() {
  const { data: problems, error: pErr } = await client.from('problems').select('id, slug').limit(2);
  console.log('Problems table:', { count: problems?.length, pErr });

  const { data: prog, error: progErr } = await client.from('user_problem_progress').select('*').limit(10);
  console.log('Progress table:', { count: prog?.length, prog, progErr });

  const { data: ws, error: wsErr } = await client.from('user_problem_workspace').select('*').limit(5);
  console.log('Workspace table:', { count: ws?.length, ws, wsErr });
}

test();

