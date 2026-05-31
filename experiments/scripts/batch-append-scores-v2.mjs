#!/usr/bin/env node
/**
 * Batch append scores-v2.csv from anon review JSONs + operator map.
 * Usage: node experiments/scripts/batch-append-scores-v2.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '../..');
const MAP = path.join(REPO, 'experiments', 'anon-map.operator-only.csv');
const ANON_ROOT = path.join(REPO, 'experiments', 'anonymous-submissions');
const SCORES = path.join(REPO, 'experiments', 'scores-v2.csv');

const map = fs
  .readFileSync(MAP, 'utf8')
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => {
    const [anon_id, run_id] = line.split(',');
    return { anon_id, run_id };
  });

if (fs.existsSync(SCORES)) fs.unlinkSync(SCORES);

for (const { anon_id, run_id } of map) {
  const reviewDir = path.join(ANON_ROOT, anon_id, 'reviews');
  if (!fs.existsSync(reviewDir)) continue;
  for (const file of fs.readdirSync(reviewDir)) {
    if (!file.endsWith('-full-rubric-review.json')) continue;
    const rel = `experiments/anonymous-submissions/${anon_id}/reviews/${file}`;
    spawnSync(
      process.execPath,
      [
        path.join(REPO, 'experiments/scripts/append-scores-v2.mjs'),
        '--run_id',
        run_id,
        '--anon_id',
        anon_id,
        '--review_json',
        rel,
      ],
      { cwd: REPO, stdio: 'inherit' },
    );
  }
}

console.log('[batch] scores-v2.csv updated');
