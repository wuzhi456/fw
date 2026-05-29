#!/usr/bin/env node
/**
 * Phase 2 scaffold: create v2 run directories + metadata.json from randomization table.
 * Usage: node experiments/scripts/scaffold-v2-runs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const RANDOMIZATION_CSV = path.join(
  REPO_ROOT,
  'experiments',
  'randomization-table-v2-16.csv',
);
const RUN_LOG_CSV = path.join(REPO_ROOT, 'experiments', 'run-log.csv');

const INTERVENTION_BY_GROUP = {
  baseline: 'experiments/interventions/baseline.md',
  'full-prompt': 'experiments/interventions/full-prompt.md',
  'experience-skill': 'experiments/interventions/experience-skill.md',
  superpowers: 'experiments/interventions/superpowers.md',
};

/** Global ledger order in run-log.csv (avoids collision with async rows 1–9). */
const V2_LEDGER_ORDER_OFFSET = 100;

function ledgerExecutionOrder(v2Slot) {
  return V2_LEDGER_ORDER_OFFSET + Number(v2Slot);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return Object.fromEntries(header.map((key, i) => [key, values[i] ?? '']));
  });
}

function readRunLogHeader() {
  const text = fs.readFileSync(RUN_LOG_CSV, 'utf8');
  const headerLine = text.split(/\r?\n/)[0];
  return headerLine.split(',');
}

function csvEscape(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function ensureRunLogV2Columns() {
  const required = [
    'protocol_version',
    'planned_run_dir',
    'build_status',
    'validation_pass_rate',
    'validation_checks_passed',
    'validation_checks_applicable',
  ];
  const lines = fs.readFileSync(RUN_LOG_CSV, 'utf8').trimEnd().split(/\r?\n/);
  let header = lines[0].split(',');
  const missing = required.filter((col) => !header.includes(col));
  if (missing.length === 0) return header;

  header = [...header, ...missing];
  const newLines = [header.join(',')];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cells = line.split(',');
    while (cells.length < header.length - missing.length) cells.push('');
    for (let i = 0; i < missing.length; i += 1) cells.push('');
    newLines.push(cells.join(','));
  }
  fs.writeFileSync(RUN_LOG_CSV, `${newLines.join('\n')}\n`, 'utf8');
  return header;
}

function appendV2Rows(rows, header) {
  const text = fs.readFileSync(RUN_LOG_CSV, 'utf8');
  const existing = text.trim().split(/\r?\n/).slice(1);
  const existingIds = new Set(
    existing.map((line) => line.split(',')[0]).filter(Boolean),
  );

  const additions = [];
  for (const row of rows) {
    if (existingIds.has(row.planned_run_id)) continue;

    const taskPath = `experiments/tasks/${row.task_id}.md`;
    const interventionPath = INTERVENTION_BY_GROUP[row.group] ?? '';

    const record = {
      run_id: row.planned_run_id,
      execution_order: ledgerExecutionOrder(row.execution_order),
      task_id: row.task_id,
      group: row.group,
      replicate: row.replicate,
      base_requirement_path: taskPath,
      intervention_path: interventionPath,
      model: '',
      temperature: '',
      reasoning_effort: '',
      context_length_estimate: '',
      injected_experience_count: '',
      output_file_count: '',
      start_time: '',
      end_time: '',
      duration_minutes: '',
      status: 'pending',
      failure_reason: '',
      retry_of: '',
      execution_quality_verdict: '',
      operator: '',
      notes: 'Phase 2 scaffold; awaiting Phase 3 execution',
      protocol_version: row.protocol_version,
      planned_run_dir: row.planned_run_dir,
      build_status: '',
      validation_pass_rate: '',
      validation_checks_passed: '',
      validation_checks_applicable: '',
    };

    additions.push(
      header.map((col) => csvEscape(record[col] ?? '')).join(','),
    );
  }

  if (additions.length === 0) {
    console.log('[scaffold] run-log v2 rows already present');
    return;
  }

  fs.appendFileSync(RUN_LOG_CSV, `${additions.join('\n')}\n`, 'utf8');
  console.log(`[scaffold] appended ${additions.length} v2 rows to run-log.csv`);
}

function fixV2RunLogExecutionOrders(rows) {
  const slotByRunId = Object.fromEntries(
    rows.map((row) => [row.planned_run_id, row.execution_order]),
  );
  const lines = fs.readFileSync(RUN_LOG_CSV, 'utf8').trimEnd().split(/\r?\n/);
  const header = lines[0].split(',');
  const orderIdx = header.indexOf('execution_order');
  const runIdIdx = header.indexOf('run_id');
  const protocolIdx = header.indexOf('protocol_version');
  if (orderIdx < 0 || runIdIdx < 0 || protocolIdx < 0) return 0;

  let fixed = 0;
  const updated = [lines[0]];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cells = line.split(',');
    const runId = cells[runIdIdx];
    const protocol = cells[protocolIdx];
    if (protocol === 'v2' && slotByRunId[runId]) {
      const expected = String(ledgerExecutionOrder(slotByRunId[runId]));
      if (cells[orderIdx] !== expected) {
        cells[orderIdx] = expected;
        fixed += 1;
      }
    }
    updated.push(cells.join(','));
  }

  if (fixed > 0) {
    fs.writeFileSync(RUN_LOG_CSV, `${updated.join('\n')}\n`, 'utf8');
    console.log(`[scaffold] fixed ${fixed} v2 execution_order values in run-log.csv`);
  }
  return fixed;
}

function scaffoldMetadata(row) {
  const runDir = path.join(REPO_ROOT, row.planned_run_dir);
  const metadataPath = path.join(runDir, 'metadata.json');

  fs.mkdirSync(path.join(runDir, 'validation'), { recursive: true });

  const metadata = {
    run_id: row.planned_run_id,
    protocol_version: row.protocol_version,
    execution_order: Number(row.execution_order),
    task_id: row.task_id,
    group: row.group,
    replicate: Number(row.replicate),
    planned_run_dir: row.planned_run_dir,
    base_requirement_path: `experiments/tasks/${row.task_id}.md`,
    validation_contract_path: 'experiments/tasks/VALIDATION-CONTRACT.md',
    intervention_path: INTERVENTION_BY_GROUP[row.group],
    model: '',
    temperature: '',
    reasoning_effort: '',
    context_length_estimate: '',
    injected_experience_count:
      row.group === 'baseline'
        ? 0
        : row.group === 'full-prompt'
          ? 18
          : null,
    output_file_count: null,
    start_time: '',
    end_time: '',
    duration_minutes: null,
    build_status: '',
    validation_pass_rate: null,
    validation_checks_passed: null,
    validation_checks_applicable: null,
    status: 'pending',
    failure_reason: '',
    retry_of: '',
    execution_quality_verdict: '',
    operator: '',
  };

  fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
  console.log(`[scaffold] ${row.planned_run_dir}/metadata.json`);
}

function main() {
  const csv = fs.readFileSync(RANDOMIZATION_CSV, 'utf8');
  const rows = parseCsv(csv);
  const header = ensureRunLogV2Columns();
  appendV2Rows(rows, header);
  fixV2RunLogExecutionOrders(rows);

  for (const row of rows) {
    scaffoldMetadata(row);
  }

  console.log(`[scaffold] done (${rows.length} planned runs)`);
}

main();
