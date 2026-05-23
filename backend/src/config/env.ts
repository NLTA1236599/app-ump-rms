import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
/** Directory that contains `package.json` and `.env` (the backend package root). */
export const BACKEND_ROOT = path.resolve(here, '..', '..');

/** Load once from a fixed path so scripts work regardless of `process.cwd()` (e.g. `npm run seed` from repo root). */
dotenv.config({ path: path.join(BACKEND_ROOT, '.env') });
