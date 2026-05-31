#!/usr/bin/env node
/**
 * Phase 4: anonymize v2 formal runs for blind rubric review.
 * Usage: node experiments/scripts/anonymize-v2-runs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '../..');
const RUN_LOG = path.join(REPO, 'experiments', 'run-log.csv');
const ANON_ROOT = path.join(REPO, 'experiments', 'anonymous-submissions');
const MAP_FILE = path.join(REPO, 'experiments', 'anon-map.operator-only.csv');

const TASK_TEXT = {
  'task-list-page': fs.readFileSync(
    path.join(REPO, 'experiments/tasks/task-list-page.md'),
    'utf8',
  ),
  'task-responsive-dashboard': fs.readFileSync(
    path.join(REPO, 'experiments/tasks/task-responsive-dashboard.md'),
    'utf8',
  ),
};

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cells = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === ',' && !inQ) {
        cells.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']));
  });
}

function copyDir(src, dest, { skip = [] } = {}) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skip.includes(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d, { skip });
    else fs.copyFileSync(s, d);
  }
}

function main() {
  const rows = parseCsv(fs.readFileSync(RUN_LOG, 'utf8')).filter(
    (r) => r.protocol_version === 'v2' && r.status === 'valid' && r.build_status === 'pass',
  );
  rows.sort((a, b) => Number(a.execution_order) - Number(b.execution_order));

  const mapLines = ['anon_id,run_id,task_id,execution_order,planned_run_dir'];
  fs.mkdirSync(ANON_ROOT, { recursive: true });

  rows.forEach((row, i) => {
    const anonId = `anon-${String(i + 1).padStart(3, '0')}`;
    const anonDir = path.join(ANON_ROOT, anonId);
    const sourceDir = path.join(anonDir, 'source');
    const outputSrc = path.join(REPO, row.planned_run_dir, 'output');

    if (!fs.existsSync(outputSrc)) {
      throw new Error(`Missing output: ${outputSrc}`);
    }

    fs.rmSync(sourceDir, { recursive: true, force: true });
    copyDir(outputSrc, sourceDir, { skip: ['node_modules', 'dist'] });

    const readme = `# Blind review package (${anonId})

## Task (frozen requirement text only)

${TASK_TEXT[row.task_id]}

## Build

\`\`\`powershell
cd source
npm install
npm run build
npm run preview
\`\`\`

Score using rubric.md. Do not infer group or intervention from file paths.
`;
    fs.writeFileSync(path.join(anonDir, 'README.txt'), readme, 'utf8');

    mapLines.push(
      `${anonId},${row.run_id},${row.task_id},${row.execution_order},${row.planned_run_dir}`,
    );
    console.log(`[anonymize] ${anonId} <- ${row.run_id}`);
  });

  fs.writeFileSync(MAP_FILE, `${mapLines.join('\n')}\n`, 'utf8');
  console.log(`[anonymize] map -> ${MAP_FILE} (${rows.length} runs)`);
}

main();
