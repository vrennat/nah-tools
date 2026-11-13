/**
 * Summarise run.ts output: verdict and log-event counts with 95% Wilson
 * intervals, and latency.
 *
 *   bun scripts/link-gate-eval/score.ts <run.jsonl>...
 */
import { readFile } from 'node:fs/promises';

type Row = {
	label: string;
	url: string;
	ms: number;
	verdict: 'allow' | 'block';
	log?: { event: string; reason: string };
};

function wilson(k: number, n: number): string {
	if (n === 0) return 'n/a';
	const z = 1.96;
	const p = k / n;
	const d = 1 + (z * z) / n;
	const c = p + (z * z) / (2 * n);
	const m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
	return `${((100 * (c - m)) / d).toFixed(1)}–${((100 * (c + m)) / d).toFixed(1)}%`;
}

for (const file of process.argv.slice(2)) {
	const rows: Row[] = (await readFile(file, 'utf8'))
		.split('\n')
		.filter(Boolean)
		.map((l) => JSON.parse(l));
	const n = rows.length;
	const blocked = rows.filter((r) => r.verdict === 'block').length;
	const suspicious = rows.filter((r) => r.log?.event === 'link_gate_allow_suspicious').length;
	const timeouts = rows.filter((r) => r.log?.reason === 'model_timeout').length;
	const byKey: Record<string, number> = {};
	for (const r of rows) {
		const k = r.verdict + (r.log ? ` ${r.log.event}/${r.log.reason}` : '');
		byKey[k] = (byKey[k] ?? 0) + 1;
	}
	const ms = rows.map((r) => r.ms).sort((a, b) => a - b);
	console.log(`\n${file}  (n = ${n})`);
	console.log(`  blocked:               ${blocked}/${n}  95% CI ${wilson(blocked, n)}`);
	console.log(
		`  blocked or suspicious: ${blocked + suspicious}/${n}  95% CI ${wilson(blocked + suspicious, n)}`
	);
	console.log(`  model timeouts:        ${timeouts}/${n}`);
	console.log(`  latency: median ${ms[Math.floor(n / 2)]} ms, p95 ${ms[Math.floor(n * 0.95)]} ms`);
	for (const [k, v] of Object.entries(byKey).sort((a, b) => b[1] - a[1])) {
		console.log(`  ${String(v).padStart(4)}  ${k}`);
	}
}
