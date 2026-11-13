/**
 * Build the phishing sample from a locally downloaded OpenPhish feed and split
 * it into tune and held-out halves. The feed and the sample stay in data/,
 * which is git-ignored: live phishing URLs are not committed to this public
 * repository.
 *
 *   bun scripts/link-gate-eval/pick-phishing.ts data/openphish.txt data/
 *
 * Keeps URLs the static destination policy does not already block, one per
 * host, in a seeded shuffle, at most 130, then writes alternate URLs to
 * phishing-tune.txt and phishing-holdout.txt in the output folder (the same
 * seed and feed always give the same split). Prints the counts to stderr.
 */
import { checkDestination } from '../../src/lib/server/destination-policy';
import { join } from 'node:path';

const [feedPath, outDir] = process.argv.slice(2);
if (!feedPath || !outDir) {
	console.error('usage: bun scripts/link-gate-eval/pick-phishing.ts <feed.txt> <output-folder>');
	process.exit(2);
}

const urls = (await Bun.file(feedPath).text())
	.split('\n')
	.map((s) => s.trim())
	.filter(Boolean);
let blocked = 0;
const seen = new Set<string>();
const kept: string[] = [];
for (const u of urls) {
	if (!checkDestination(u, { forRedirect: true }).ok) {
		blocked++;
		continue;
	}
	const host = new URL(u).hostname;
	if (seen.has(host)) continue;
	seen.add(host);
	kept.push(u);
}
let x = 42;
const rnd = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
kept.sort(() => rnd() - 0.5);
const sample = kept.slice(0, 130);
const tune = sample.filter((_, i) => i % 2 === 0);
const holdout = sample.filter((_, i) => i % 2 === 1);
await Bun.write(join(outDir, 'phishing-tune.txt'), tune.join('\n') + '\n');
await Bun.write(join(outDir, 'phishing-holdout.txt'), holdout.join('\n') + '\n');
console.error(
	`feed ${urls.length}, blocked by the static policy ${blocked}, unique hosts ${kept.length}; ` +
		`sample ${sample.length}: tune ${tune.length}, holdout ${holdout.length}`
);
