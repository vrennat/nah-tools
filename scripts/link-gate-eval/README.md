# Link spam gate evaluation

Measures the link spam gate (`src/lib/server/link-gate/`) end to end: the real redirect follower, page reader and decision rules, with Cloudflare's Clef model called through a local helper Worker.

## What is here

| File | Purpose |
|---|---|
| `clean-tune.txt`, `clean-holdout.txt` | 108 public sites (docs, shops, news, social, government, banks, sign-in and download pages), split 54/54 by a seeded shuffle |
| `pick-phishing.ts` | Builds the phishing sample from a locally downloaded OpenPhish feed and splits it into tune and held-out halves |
| `run.ts` | Runs the gate over a URL list and writes one JSON line per URL |
| `score.ts` | Counts verdicts and log events, with 95% Wilson intervals and latency |
| `clef-worker/` | A local Worker that gives the eval a Workers AI binding over your wrangler login. It accepts only JSON requests for the Clef model, and has no workers.dev URL or route |
| `tsconfig.json` | Typechecks these scripts (`bunx tsc -p scripts/link-gate-eval`, also run by `bun run check`) |

**Phishing URLs are not committed.** They are live attack URLs, and this repository is public. The feed and the sample go in `data/`, which is git-ignored. Re-download the feed for each run: phishing pages go offline within days, so an old sample mostly measures dead hosts.

## Held-out split

Change thresholds in `decide.ts` only while looking at `clean-tune.txt` and `data/phishing-tune.txt`. Report results only on `clean-holdout.txt` and `data/phishing-holdout.txt`. `pick-phishing.ts` writes both phishing halves from one seeded shuffle, so the same feed always gives the same split.

**Caveat:** the thresholds now in `decide.ts` were set on 2026-11-13 using all 108 clean sites and a 130-URL phishing sample, before this split existed. Hold-out results on that same data are therefore not independent.

A fresh sample is less dependent, not independent: phishing kits, hosting providers and target brands repeat from week to week. To reduce the overlap:
- pass the earlier sample to `pick-phishing.ts` with `--exclude`, so no host from it is reused;
- report every hold-out figure with its 95% interval, as `score.ts` prints it. With 65 URLs per half, the interval is wide (for 50 of 65, about 65–85%).

## Run it

**Where to run it:** a run fetches live phishing URLs from the machine it runs on, from that machine's IP address, with a User-Agent that names nah.tools (`nah.tools link check`). Phishing hosts log visitors, and some serve exploits. Run it from a disposable network or a throwaway remote host (a short-lived VM), not from a personal or work machine on your home or office network.

1. Start the helper Worker (it uses your `wrangler login`; Clef calls are billed to the account):

   ```bash
   cd scripts/link-gate-eval/clef-worker && bunx wrangler@latest dev --port 8799
   ```

2. Get the phishing sample. Downloading the feed is a manual step; check its terms of use first.

   ```bash
   mkdir -p scripts/link-gate-eval/data
   curl -sSL -o scripts/link-gate-eval/data/openphish.txt https://openphish.com/feed.txt
   bun scripts/link-gate-eval/pick-phishing.ts scripts/link-gate-eval/data/openphish.txt scripts/link-gate-eval/data/
   ```

   If you kept an earlier sample, move it aside first and pass it as `--exclude <old-sample.txt>` (more than once for several), so the new halves share no host with it.

3. Report on the held-out halves only (when tuning, run the same commands on the `-tune` files instead):

   ```bash
   bun scripts/link-gate-eval/run.ts clean scripts/link-gate-eval/clean-holdout.txt scripts/link-gate-eval/data/clean-holdout.jsonl
   bun scripts/link-gate-eval/run.ts spam scripts/link-gate-eval/data/phishing-holdout.txt scripts/link-gate-eval/data/phishing-holdout.jsonl
   bun scripts/link-gate-eval/score.ts scripts/link-gate-eval/data/clean-holdout.jsonl scripts/link-gate-eval/data/phishing-holdout.jsonl
   ```

## Cost and limits

- One run over 108 clean sites and 130 phishing URLs was about 0.45M input tokens on `@cf/cloudflare/clef`, about $0.11 (2026-11-13).
- Many feed URLs already show Cloudflare's "Suspected Phishing" page; `score.ts` counts those blocks under `cloudflare_warning`. Report them separately from model blocks.

## Differences from production

- **Where fetches come from:** your machine, not Cloudflare. Sites that treat Cloudflare egress differently (cloaking, bot walls) can behave differently in production.
- **Later hops:** production checks every redirect hop against the static destination policy and the D1 `blocked_domains` list. The eval has no database, so later hops get the static policy only.
- **Model timeout:** production gives the model 4000 ms (`CLEF_TIMEOUT_MS`) for a call made inside Cloudflare. In the eval the same budget also covers two extra legs: from this machine to the helper Worker, and from the helper Worker to Workers AI. Timeouts are therefore more likely than in production. `run.ts` passes the timeout explicitly (set `CLEF_EVAL_TIMEOUT_MS` to change it) and prints how many calls timed out; `score.ts` prints the count per file. Report it next to the results.

## Results on record

On 2026-11-13, with the policy merged in #53 plus the cross-host rule:
- Clean: 1 of 108 blocked (login.microsoftonline.com, an OAuth bounce ending on a 404). 15 were allowed with a log line.
- Phishing: 96 of 130 blocked (47 on the Cloudflare warning, 49 by the model). 109 of 130 were blocked or logged as suspicious.

These numbers come from the same data the thresholds were tuned on; see the caveat above.
