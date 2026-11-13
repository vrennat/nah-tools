/**
 * Run the real link gate (judgeDestination) over a list of URLs.
 *
 *   bun scripts/link-gate-eval/run.ts <label> <urls.txt> <out.jsonl>
 *
 * Needs the helper Worker from clef-worker/ running on localhost:8799 (see
 * README.md). Two differences from production, both stated in the README:
 * - Fetches go out from this machine, not from Cloudflare, and later hops are
 *   checked against the static destination policy only, not the D1 blocklist.
 * - The model timeout (CLEF_TIMEOUT_MS, or CLEF_EVAL_TIMEOUT_MS if set) also
 *   covers the round trip to the helper Worker and from it to Workers AI.
 *   The model-timeout count is printed at the end.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { CLEF_TIMEOUT_MS, judgeDestination } from '../../src/lib/server/link-gate/index';

const [label, file, out] = process.argv.slice(2);
if (!label || !file || !out) {
	console.error('usage: bun scripts/link-gate-eval/run.ts <label> <urls.txt> <out.jsonl>');
	process.exit(2);
}
const ENDPOINT = process.env.CLEF_EVAL_ENDPOINT ?? 'http://localhost:8799';
const clefTimeoutMs = Number(process.env.CLEF_EVAL_TIMEOUT_MS) || CLEF_TIMEOUT_MS;
const urls = (await readFile(file, 'utf8'))
	.split('\n')
	.map((s) => s.trim())
	.filter((s) => s && !s.startsWith('#'));

let tokens = 0;
const ai = {
	run: async (model_id: string, input: unknown) => {
		const res = await fetch(ENDPOINT, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ model_id, input })
		});
		const j = (await res.json()) as { r?: { usage?: { input_tokens?: number } }; error?: string };
		if (!j.r) throw new Error(j.error ?? 'no result');
		tokens += j.r.usage?.input_tokens ?? 0;
		return j.r;
	}
};

const lines: string[] = [];
let timeouts = 0;
let next = 0;
await Promise.all(
	Array.from({ length: 6 }, async () => {
		while (next < urls.length) {
			const url = urls[next++];
			const t = Date.now();
			const d = await judgeDestination(url, { ai, clefTimeoutMs });
			if (d.log?.reason === 'model_timeout') timeouts++;
			lines.push(JSON.stringify({ label, url, ms: Date.now() - t, ...d }));
		}
	})
);
await writeFile(out, lines.join('\n') + '\n');
console.log(
	`${label}: ${urls.length} URLs, model timeout ${clefTimeoutMs} ms, ${timeouts} model timeouts, ` +
		`${tokens} input tokens (about $${((tokens * 0.24) / 1e6).toFixed(3)} on clef)`
);
