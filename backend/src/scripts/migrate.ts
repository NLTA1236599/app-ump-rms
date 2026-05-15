import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', '..', 'schema.sql');

async function main() {
  const sql = readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('Migration applied.');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
