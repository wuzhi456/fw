#!/usr/bin/env node
/**
 * Protocol v2 validation CLI (frozen interface).
 * Usage:
 *   node experiments/validation/run-validation.mjs \
 *     --task task-list-page \
 *     --output experiments/runs/.../output \
 *     --run-id list-base-r01 \
 *     [--group baseline] [--rep 1]
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHECK_CATALOG, TASK_SPECS, extractCheckId } from './check-catalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const VALIDATION_DIR = __dirname;
const RESULTS_CSV = path.join(REPO_ROOT, 'experiments', 'validation-results.csv');

const CSV_HEADER =
  'run_id,task_id,group,rep,check_id,check_type,status,evidence_path,notes';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    const name = key.slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) {
      args[name] = true;
    } else {
      args[name] = value;
      i += 1;
    }
  }
  return args;
}

function run(cmd, cmdArgs, options = {}) {
  const result = spawnSync(cmd, cmdArgs, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  return result.status ?? 1;
}

function runCapture(cmd, cmdArgs, options = {}) {
  return spawnSync(cmd, cmdArgs, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    ...options,
  });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function csvEscape(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function appendResults(rows) {
  ensureDir(path.dirname(RESULTS_CSV));
  if (!fs.existsSync(RESULTS_CSV)) {
    fs.writeFileSync(RESULTS_CSV, `${CSV_HEADER}\n`, 'utf8');
  }
  const lines = rows.map((row) =>
    [
      row.run_id,
      row.task_id,
      row.group,
      row.rep,
      row.check_id,
      row.check_type,
      row.status,
      row.evidence_path,
      row.notes,
    ]
      .map(csvEscape)
      .join(','),
  );
  fs.appendFileSync(RESULTS_CSV, `${lines.join('\n')}\n`, 'utf8');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok || res.status < 500) return true;
    } catch {
      // retry
    }
    await sleep(500);
  }
  return false;
}

function startPreview(outputDir, port) {
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(
    npmCmd,
    ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)],
    {
      cwd: outputDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      env: { ...process.env, BROWSER: 'none' },
    },
  );
  return child;
}

function parsePlaywrightReport(reportPath, taskId, meta) {
  const catalog = CHECK_CATALOG[taskId];
  if (!catalog) {
    throw new Error(`Unknown task_id: ${taskId}`);
  }

  const raw = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const byCheckId = new Map();

  for (const suite of raw.suites ?? []) {
    collectSpecs(suite, byCheckId);
  }

  const rows = [];
  for (const [checkId, checkType] of Object.entries(catalog)) {
    const spec = byCheckId.get(checkId);
    let status = 'fail';
    let notes = '';
    let evidence_path = '';

    if (!spec) {
      status = 'fail';
      notes = 'check not found in playwright report';
    } else if (spec.status === 'passed' || spec.status === 'expected') {
      status = 'pass';
    } else if (spec.status === 'skipped') {
      status = 'not_testable';
      notes = spec.errors?.[0]?.message ?? 'skipped';
    } else {
      status = 'fail';
      notes = (spec.errors ?? [])
        .map((e) => e.message ?? String(e))
        .join(' | ')
        .slice(0, 500);
      if (spec.attachments?.length) {
        evidence_path = spec.attachments[0].path ?? '';
      }
    }

    rows.push({
      run_id: meta.run_id,
      task_id: taskId,
      group: meta.group,
      rep: meta.rep,
      check_id: checkId,
      check_type: checkType,
      status,
      evidence_path,
      notes,
    });

    console.log(`${checkId}: ${status}`);
  }

  return rows;
}

function collectSpecs(suite, map, titlePrefix = '') {
  const title = titlePrefix
    ? `${titlePrefix} > ${suite.title}`
    : suite.title ?? '';

  for (const spec of suite.specs ?? []) {
    const checkId = extractCheckId(spec.title);
    if (checkId) {
      const result = spec.tests?.[0]?.results?.[0];
      const rawStatus = result?.status ?? (spec.ok ? 'passed' : 'failed');
      map.set(checkId, {
        status: rawStatus,
        errors: result?.errors ?? [],
        attachments: result?.attachments ?? [],
      });
    }
  }

  for (const child of suite.suites ?? []) {
    collectSpecs(child, map, title);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const taskId = args.task;
  const outputArg = args.output;
  const runId = args['run-id'] ?? args.runId ?? 'unknown-run';
  const group = args.group ?? '';
  const rep = args.rep ?? '';

  if (!taskId || !outputArg) {
    console.error(
      'Usage: node run-validation.mjs --task <task-id> --output <path> --run-id <id> [--group g] [--rep n]',
    );
    process.exit(1);
  }

  const specRel = TASK_SPECS[taskId];
  if (!specRel) {
    console.error(`Unknown task: ${taskId}`);
    process.exit(1);
  }

  const outputDir = path.resolve(REPO_ROOT, outputArg);
  if (!fs.existsSync(outputDir)) {
    console.error(`Output directory not found: ${outputDir}`);
    process.exit(1);
  }

  const nodeModules = path.join(outputDir, 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    console.log(`[validation] npm install in ${outputDir}`);
    const installCode = run('npm', ['install'], { cwd: outputDir });
    if (installCode !== 0) {
      console.log('gate-build: fail');
      process.exit(1);
    }
  }

  console.log(`[validation] npm run build in ${outputDir}`);
  const buildCode = run('npm', ['run', 'build'], { cwd: outputDir });
  if (buildCode !== 0) {
    console.log('gate-build: fail');
    process.exit(1);
  }
  console.log('gate-build: pass');

  const port = 4173 + Math.floor(Math.random() * 1000);
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[validation] starting preview at ${baseUrl}`);

  const preview = startPreview(outputDir, port);
  let previewLog = '';
  preview.stdout?.on('data', (d) => {
    previewLog += d.toString();
  });
  preview.stderr?.on('data', (d) => {
    previewLog += d.toString();
  });

  const ready = await waitForServer(baseUrl);
  if (!ready) {
    preview.kill('SIGTERM');
    console.error('Preview server failed to start');
    console.error(previewLog.slice(-2000));
    process.exit(1);
  }

  const reportPath = path.join(VALIDATION_DIR, 'playwright-report.json');
  if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);

  const testCode = run(
    'npx',
    ['playwright', 'test', specRel, '--config', 'playwright.config.ts'],
    {
      cwd: VALIDATION_DIR,
      env: {
        ...process.env,
        VALIDATION_BASE_URL: baseUrl,
      },
    },
  );

  preview.kill('SIGTERM');

  if (!fs.existsSync(reportPath)) {
    console.error('Playwright JSON report missing');
    process.exit(testCode || 1);
  }

  const rows = parsePlaywrightReport(reportPath, taskId, {
    run_id: runId,
    group,
    rep,
  });
  appendResults(rows);

  const applicable = rows.filter(
    (r) => r.status === 'pass' || r.status === 'fail',
  );
  const passed = applicable.filter((r) => r.status === 'pass').length;
  const rate =
    applicable.length === 0 ? 0 : passed / applicable.length;
  console.log(
    `[validation] validation_pass_rate=${passed}/${applicable.length} (${(rate * 100).toFixed(1)}%)`,
  );
  console.log(`[validation] appended ${rows.length} rows to ${RESULTS_CSV}`);

  process.exit(testCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
