/**
 * Run the real link gate (judgeDestination) over a list of URLs.
 *
 *   bun scripts/link-gate-eval/run.ts <label> <urls.txt> <out.jsonl>
 *
 * Needs the helper Worker from clef-worker/ running on localhost:8799 (see
 * README.md). Fetches go out from this machine, not from Cloudflare, so
 * sites that treat Cloudflare egress differently can behave differently.
 */
import { judgeDestination } from '../../src/lib/server/link-gate/index';

const [label, file, out] = process.argv.slice(2);
if (!label || !file || !out) {
	console.error('usage: bun scripts/link-gate-eval/run.ts <label> <urls.txt> <out.jsonl>');
	process.exit(2);
}
const ENDPOINT = process.env.CLEF_EVAL_ENDPOINT ?? 'http://localhost:8799';
const urls = (await Bun.file(file).text())
	.split('\n')
	.map((s) => s.trim())
	.filter((s) => s && !s.startsWith('#'));

let tokens = 0;
const ai = {
	run: async (model_id: string, input: unknown) => {
		const res = await fetch(ENDPOINT, { method: 'POST', body: JSON.stringify({ model_id, input }) });
		const j = (await res.json()) as { r?: { usage?: { input_tokens?: number } }; error?: string };
		if (!j.r) throw new Error(j.error ?? 'no result');
		tokens += j.r.usage?.input_tokens ?? 0;
		return j.r;
	}
};

const lines: string[] = [];
let next = 0;
await Promise.all(
	Array.from({ length: 6 }, async () => {
		while (next < urls.length) {
			const url = urls[next++];
			const t = Date.now();
			const d = await judgeDestination(url, { ai });
			lines.push(JSON.stringify({ label, url, ms: Date.now() - t, ...d }));
		}
	})
);
await Bun.write(out, lines.join('\n') + '\n');
console.log(
	`${label}: ${urls.length} URLs, ${tokens} input tokens (about $${((tokens * 0.24) / 1e6).toFixed(3)} on clef)`
);
