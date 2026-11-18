// authored r9 — written by this agent session
// cap: the output dir holds game/, screenshots/ and dossier.json within the scorer caps
// This program builds the "Solano Drive" game distribution by copying
// game/ and screenshots/ directories to the output directory and generating 
// a dossier.json file using the vendored buildDossier library. It enforces 
// caps: 163840 text bytes, 4 screenshots at 256 KiB each, and 993 game files 
// totaling up to 48 MiB.

import { cpSync, existsSync, mkdirSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

const dp = join(out, 'dossier.json');
const d = JSON.parse(readFileSync(dp, 'utf8'));
console.log(`Solano Drive build: dossier ${dp} (${statSync(dp).size} bytes, ${d.images?.length ?? 0} images.`);
