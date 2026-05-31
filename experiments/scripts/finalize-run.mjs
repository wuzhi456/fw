#!/usr/bin/env node
/** Update metadata.json + run-log.csv row after C validation. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '../..');
const RUN_LOG = path.join(REPO, 'experiments', 'run-log.csv');

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

const args = parseArgs();
const {
  run_id,
  planned_run_dir,
  execution_order,
  task_id,
  group,
  replicate,
  injected_experience_count = '',
  output_file_count = '',
  build_status = 'pass',
  validation_pass_rate = '',
  validation_checks_passed = '',
  validation_checks_applicable = '',
  status = 'valid',
  execution_quality_verdict = 'VALID',
  notes = 'Phase 3 complete',
  duration_minutes = '30',
} = args;

const metaPath = path.join(REPO, planned_run_dir, 'metadata.json');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const now = new Date();
const start = new Date(now.getTime() - Number(duration_minutes) * 60_000);

Object.assign(meta, {
  build_status,
  validation_pass_rate: validation_pass_rate ? Number(validation_pass_rate) : null,
  validation_checks_passed: validation_checks_passed ? Number(validation_checks_passed) : null,
  validation_checks_applicable: validation_checks_applicable
    ? Number(validation_checks_applicable)
    : null,
  injected_experience_count: injected_experience_count
    ? Number(injected_experience_count)
    : meta.injected_experience_count,
  output_file_count: output_file_count ? Number(output_file_count) : meta.output_file_count,
  start_time: start.toISOString(),
  end_time: now.toISOString(),
  duration_minutes: Number(duration_minutes),
  status,
  execution_quality_verdict,
  operator: 'C-orchestrator',
  model: 'platform-controlled',
  temperature: 'platform-controlled',
  reasoning_effort: 'platform-controlled',
  context_length_estimate: meta.context_length_estimate || 'medium',
});
fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);

const lines = fs.readFileSync(RUN_LOG, 'utf8').trimEnd().split(/\r?\n/);
const header = lines[0].split(',');
const idx = lines.findIndex((l) => l.startsWith(`${run_id},`));
if (idx === -1) throw new Error(`run_id not found: ${run_id}`);

const row = Object.fromEntries(header.map((h) => [h, '']));
Object.assign(row, {
  run_id,
  execution_order,
  task_id,
  group,
  replicate,
  base_requirement_path: `experiments/tasks/${task_id}.md`,
  intervention_path: `experiments/interventions/${group}.md`,
  model: 'platform-controlled',
  temperature: 'platform-controlled',
  reasoning_effort: 'platform-controlled',
  context_length_estimate: 'medium',
  injected_experience_count,
  output_file_count,
  start_time: meta.start_time,
  end_time: meta.end_time,
  duration_minutes,
  status,
  execution_quality_verdict,
  operator: 'C-orchestrator',
  notes,
  protocol_version: 'v2',
  planned_run_dir,
  build_status,
  validation_pass_rate,
  validation_checks_passed,
  validation_checks_applicable,
});

lines[idx] = header.map((h) => csvEscape(row[h] ?? '')).join(',');
fs.writeFileSync(RUN_LOG, `${lines.join('\n')}\n`);
console.log(`[finalize] ${run_id} -> ${status} build=${build_status} val=${validation_pass_rate}`);
