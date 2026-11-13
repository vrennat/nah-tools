/**
 * Build the phishing sample from a locally downloaded OpenPhish feed. The
 * feed and the sample stay in data/, which is git-ignored: live phishing URLs
 * are not committed to this public repository.
 *
 *   bun scripts/link-gate-eval/pick-phishing.ts data/openphish.txt > data/phishing.txt
 *
 * Keeps URLs the static destination policy does not already block, one per
 * host, in a seeded shuffle, at most 130. Prints the baseline count to stderr.
 */
import { checkDestination } from '../../src/lib/server/destination-policy';

const urls = (await Bun.file(process.argv[2]).text())
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
console.error(`feed ${urls.length}, blocked by the static policy ${blocked}, unique hosts kept ${kept.length}`);
let x = 42;
const rnd = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
kept.sort(() => rnd() - 0.5);
console.log(kept.slice(0, 130).join('\n'));
