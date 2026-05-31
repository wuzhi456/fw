#!/usr/bin/env node
/**
 * Append one row to scores-v2.csv from a full-rubric-review JSON.
 * Usage:
 *   node experiments/scripts/append-scores-v2.mjs \
 *     --run_id list-skill-r01 --anon_id anon-001 \
 *     --review_json experiments/anonymous-submissions/anon-001/reviews/llm-reviewer-v2-full-rubric-review.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '../..');
const SCORES_CSV = path.join(REPO, 'experiments', 'scores-v2.csv');
const HEADER =
  'run_id,anon_id,reviewer_id,reviewer_type,rubric_total,functional,productization,code,review_json_path';

function parseArgs() {
  const out = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    out[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  }
  return out;
}

function csvEscape(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function reviewerType(id) {
  return id.includes('human') ? 'human' : 'llm';
}

const args = parseArgs();
const review = JSON.parse(fs.readFileSync(path.resolve(REPO, args.review_json), 'utf8'));
const row = {
  run_id: args.run_id,
  anon_id: args.anon_id,
  reviewer_id: review.reviewer_id,
  reviewer_type: reviewerType(review.reviewer_id),
  rubric_total: review.total_score_0_100,
  functional: review.category_functional_points,
  productization: review.category_productization_points,
  code: review.category_code_quality_points,
  review_json_path: args.review_json.replace(/\\/g, '/'),
};

if (!fs.existsSync(SCORES_CSV)) {
  fs.writeFileSync(SCORES_CSV, `${HEADER}\n`, 'utf8');
}

const line = [
  row.run_id,
  row.anon_id,
  row.reviewer_id,
  row.reviewer_type,
  row.rubric_total,
  row.functional,
  row.productization,
  row.code,
  row.review_json_path,
]
  .map(csvEscape)
  .join(',');

fs.appendFileSync(SCORES_CSV, `${line}\n`, 'utf8');
console.log(`[scores-v2] ${row.run_id} ${row.reviewer_id} total=${row.rubric_total}`);
