import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
      env[key] = val;
    }
  }
  return env;
}

const localEnv = loadEnvFile(path.join(rootDir, '.env.local'));
const baseEnv = loadEnvFile(path.join(rootDir, '.env'));

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  localEnv.NEXT_PUBLIC_SUPABASE_URL ||
  baseEnv.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  localEnv.VITE_SUPABASE_URL ||
  baseEnv.VITE_SUPABASE_URL ||
  '';

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  localEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  baseEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  localEnv.VITE_SUPABASE_ANON_KEY ||
  baseEnv.VITE_SUPABASE_ANON_KEY ||
  '';

console.log('\n========================================');
console.log('       SUPABASE CONNECTION AUDIT        ');
console.log('========================================');
console.log(`URL detected:   ${supabaseUrl ? supabaseUrl : '(Not found)'}`);
console.log(`Key detected:   ${supabaseKey ? (supabaseKey.length > 10 ? `${supabaseKey.slice(0, 10)}...` : supabaseKey) : '(Not found)'}`);

const isPlaceholder =
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl.includes('your-project') ||
  supabaseKey.includes('your-publishable-key') ||
  supabaseKey.includes('your-anon-key');

if (isPlaceholder) {
  console.log('\n[STATUS]: PENDING CONFIGURATION');
  console.log('Environment variables are currently set to placeholders.');
  console.log('To connect to your real Supabase project:');
  console.log('1. Open .env.local');
  console.log('2. Replace NEXT_PUBLIC_SUPABASE_URL with your Supabase Project URL');
  console.log('3. Replace NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY with your Project Anon/Publishable Key');
  console.log('4. Re-run this check: npm run verify-supabase\n');
  process.exit(0);
}

console.log('\n[STATUS]: TESTING CONNECTION...');

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error(`\n[ERROR]: Supabase replied with error: ${error.message}`);
    process.exit(1);
  } else {
    console.log('\n[SUCCESS]: Successfully connected to Supabase endpoint!');
    console.log(`Endpoint reachable: ${supabaseUrl}`);
    console.log(`Auth service status: OK (Session active: ${Boolean(data?.session)})`);
    console.log('========================================\n');
    process.exit(0);
  }
} catch (err) {
  console.error(`\n[ERROR]: Connection failed: ${err.message}`);
  process.exit(1);
}
