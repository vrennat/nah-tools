# Link spam gate evaluation

Measures the link spam gate (`src/lib/server/link-gate/`) end to end: the real redirect follower, page reader and decision rules, with Cloudflare's Clef model called through a local helper Worker.

## What is here

| File | Purpose |
|---|---|
| `clean-tune.txt`, `clean-holdout.txt` | 108 public sites (docs, shops, news, social, government, banks, sign-in and download pages), split 54/54 by a seeded shuffle |
| `pick-phishing.ts` | Builds the phishing sample from a locally downloaded OpenPhish feed |
| `run.ts` | Runs the gate over a URL list and writes one JSON line per URL |
| `score.ts` | Counts verdicts and log events, with 95% Wilson intervals and latency |
| `clef-worker/` | A local Worker that gives the eval a Workers AI binding over your wrangler login |

**Phishing URLs are not committed.** They are live attack URLs, and this repository is public. The feed and the sample go in `data/`, which is git-ignored. Re-download the feed for each run: phishing pages go offline within days, so an old sample mostly measures dead hosts.

## Held-out split

Change thresholds in `decide.ts` only while looking at `clean-tune.txt` and the tune half of the phishing sample. Report results on `clean-holdout.txt` and the other half.

**Caveat:** the thresholds now in `decide.ts` were set on 2026-11-13 using all 108 clean sites and a 130-URL phishing sample, before this split existed. Hold-out results on that same data are therefore not independent. A fresh phishing sample is independent; a fresh clean list would be too.

## Run it

1. Start the helper Worker (it uses your `wrangler login`; Clef calls are billed to the account):

   ```bash
   cd scripts/link-gate-eval/clef-worker && bunx wrangler@latest dev --port 8799
   ```

2. Get the phishing sample. Downloading the feed is a manual step; check its terms of use first.

   ```bash
   mkdir -p scripts/link-gate-eval/data
   curl -sSL -o scripts/link-gate-eval/data/openphish.txt https://openphish.com/feed.txt
   bun scripts/link-gate-eval/pick-phishing.ts scripts/link-gate-eval/data/openphish.txt > scripts/link-gate-eval/data/phishing.txt
   ```

3. Run the gate and score it:

   ```bash
   bun scripts/link-gate-eval/run.ts clean scripts/link-gate-eval/clean-holdout.txt scripts/link-gate-eval/data/clean-holdout.jsonl
   bun scripts/link-gate-eval/run.ts spam scripts/link-gate-eval/data/phishing.txt scripts/link-gate-eval/data/phishing.jsonl
   bun scripts/link-gate-eval/score.ts scripts/link-gate-eval/data/clean-holdout.jsonl scripts/link-gate-eval/data/phishing.jsonl
   ```

## Cost and limits

- One run over 108 clean sites and 130 phishing URLs was about 0.45M input tokens on `@cf/cloudflare/clef`, about $0.11 (2026-11-13).
- Fetches go out from your machine, not from Cloudflare, so sites that treat Cloudflare egress differently (cloaking, bot walls) can behave differently in production.
- Many feed URLs already show Cloudflare's "Suspected Phishing" page; `score.ts` counts those blocks under `cloudflare_warning`. Report them separately from model blocks.

## Results on record

On 2026-11-13, with the policy merged in #53 plus the cross-host rule:
- Clean: 1 of 108 blocked (login.microsoftonline.com, an OAuth bounce ending on a 404). 15 were allowed with a log line.
- Phishing: 96 of 130 blocked (47 on the Cloudflare warning, 49 by the model). 109 of 130 were blocked or logged as suspicious.

These numbers come from the same data the thresholds were tuned on; see the caveat above.
