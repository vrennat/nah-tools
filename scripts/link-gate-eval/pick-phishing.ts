/**
 * Build the phishing sample from a locally downloaded OpenPhish feed and split
 * it into tune and held-out halves. The feed and the sample stay in data/,
 * which is git-ignored: live phishing URLs are not committed to this public
 * repository.
 *
 *   bun scripts/link-gate-eval/pick-phishing.ts <feed.txt> <output-folder> [--exclude <file>]...
 *
 * Keeps URLs the static destination policy does not already block, one per
 * host, drops hosts listed in any --exclude file (URLs or bare hosts, one per
 * line; pass an earlier sample so a new hold-out does not reuse its hosts),
 * shuffles them with a seeded Fisher-Yates shuffle, keeps at most 130, then
 * writes alternate URLs to phishing-tune.txt and phishing-holdout.txt in the
 * output folder. The same seed, feed and exclusions always give the same
 * split. Prints the counts to stderr.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { checkDestination } from '../../src/lib/server/destination-policy';

const SEED = 42;
const SAMPLE_SIZE = 130;

const args = process.argv.slice(2);
const excludeFiles: string[] = [];
const positional: string[] = [];
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--exclude') excludeFiles.push(args[++i]);
	else positional.push(args[i]);
}
const [feedPath, outDir] = positional;
if (!feedPath || !outDir || excludeFiles.some((f) => !f)) {
	console.error('usage: bun scripts/link-gate-eval/pick-phishing.ts <feed.txt> <output-folder> [--exclude <file>]...');
	process.exit(2);
}

const lines = async (path: string) =>
	(await readFile(path, 'utf8'))
		.split('\n')
		.map((s) => s.trim())
		.filter((s) => s && !s.startsWith('#'));

function hostOf(entry: string): string | null {
	try {
		return new URL(entry.includes('://') ? entry : `https://${entry}`).hostname.toLowerCase();
	} catch {
		return null;
	}
}

/** mulberry32: a small seeded generator that gives the same sequence in every engine. */
function seededRandom(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Fisher-Yates shuffle of a copy of items, driven by rnd. */
function shuffle<T>(items: readonly T[], rnd: () => number): T[] {
	const out = items.slice();
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rnd() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

const excluded = new Set<string>();
for (const f of excludeFiles) {
	for (const entry of await lines(f)) {
		const h = hostOf(entry);
		if (h) excluded.add(h);
	}
}

const urls = await lines(feedPath);
let blocked = 0;
let skippedExcluded = 0;
const seen = new Set<string>();
const kept: string[] = [];
for (const u of urls) {
	if (!checkDestination(u, { forRedirect: true }).ok) {
		blocked++;
		continue;
	}
	const host = hostOf(u);
	if (!host || seen.has(host)) continue;
	seen.add(host);
	if (excluded.has(host)) {
		skippedExcluded++;
		continue;
	}
	kept.push(u);
}
const sample = shuffle(kept, seededRandom(SEED)).slice(0, SAMPLE_SIZE);
const tune = sample.filter((_, i) => i % 2 === 0);
const holdout = sample.filter((_, i) => i % 2 === 1);
await writeFile(join(outDir, 'phishing-tune.txt'), tune.join('\n') + '\n');
await writeFile(join(outDir, 'phishing-holdout.txt'), holdout.join('\n') + '\n');
console.error(
	`feed ${urls.length}, blocked by the static policy ${blocked}, unique hosts ${seen.size}, ` +
		`excluded as seen before ${skippedExcluded}; sample ${sample.length}: tune ${tune.length}, holdout ${holdout.length}`
);
