<script lang="ts">
	const tools = [
		{
			name: 'list_brokers',
			description: 'Filter and list brokers by priority, difficulty, opt-out method, or category. Returns IDs, names, parent/subsidiary relationships, and relist timelines.'
		},
		{
			name: 'get_broker',
			description: 'Get full details for a specific broker: step-by-step opt-out instructions, URLs, required info, verification method, and notes.'
		},
		{
			name: 'get_broker_search_url',
			description: 'Get a pre-filled search URL to check if your data appears on a broker site before opting out.'
		},
		{
			name: 'generate_removal_email',
			description: 'Generate a CCPA or GDPR data deletion request email with correct legal language, recipient, subject, body, and a mailto link.'
		},
		{
			name: 'get_removal_plan',
			description: 'Get a prioritized, deduplicated removal plan — groups brokers by priority, rolls up subsidiaries, and estimates total time.'
		},
		{
			name: 'generate_all_emails',
			description: 'Generate deletion emails for every email-accepting broker at once. Takes your info once, returns all emails with mailto links — the fastest path without browser access.'
		}
	];
</script>

<svelte:head>
	<title>MCP Server for Data Broker Removal — nah</title>
	<meta
		name="description"
		content="Give your AI agent structured data on 25+ data broker opt-out procedures. Open-source MCP server — no account, no tracking, no data stored."
	/>
</svelte:head>

<article class="mx-auto max-w-3xl space-y-8">
	<header class="space-y-3">
		<p class="text-sm font-medium text-accent">
			<a href="/remove" class="hover:underline">&larr; Back to manual removal</a>
		</p>
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">
			Your AI is smart. It just doesn't know how to opt you out of Spokeo.
		</h1>
		<p class="text-lg text-text-muted">
			This MCP server gives any AI agent structured data on 25+ data broker opt-out procedures — step-by-step instructions, pre-filled search URLs, legal email templates, and a prioritized removal plan. Connect it once and your agent knows how to remove you from every major people-search site.
		</p>
	</header>

	<section class="space-y-4 rounded-xl border border-accent/30 bg-accent/5 p-5">
		<h2 class="text-xl font-700">No data stored. No data logged. No account.</h2>
		<p class="text-text-muted">
			The MCP server is completely stateless. It serves broker data and generates emails from the information you provide in each request — nothing is stored, logged, or transmitted beyond the immediate response. There is no account, no API key, and no tracking.
		</p>
		<p class="text-text-muted">
			The server source code is <a href="https://github.com/vrennat/nah-tools" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">open source</a>. The irony of giving your PII to a data removal service that then stores it is not lost on us — so we don't.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-700">What is MCP?</h2>
		<p class="text-text-muted">
			<a href="https://modelcontextprotocol.io" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">Model Context Protocol</a>
			is an open standard that lets AI agents use external tools. Instead of building "an AI product," we built a resource layer — your existing AI (Claude, or any MCP-compatible agent) connects to our server and gains access to structured opt-out data it didn't have before.
		</p>
		<p class="text-text-muted">
			The intelligence is your agent's. The opt-out data is ours.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-700">What the server actually returns</h2>
		<ul class="list-disc space-y-2 pl-6 text-text-muted">
			<li>A database of <strong class="text-text">25+ data brokers</strong> with step-by-step opt-out procedures, opt-out URLs, and required information for each</li>
			<li><strong class="text-text">Pre-filled search URLs</strong> for 11 brokers so your agent can check if you're listed before opting out</li>
			<li><strong class="text-text">Legally-grounded CCPA/GDPR deletion emails</strong> with correct legal language, ready to send via mailto link</li>
			<li><strong class="text-text">Prioritized removal plans</strong> that deduplicate subsidiaries — opting out of Intelius covers TruthFinder, Instant Checkmate, Zabasearch, and 3 others</li>
			<li><strong class="text-text">Verification requirements</strong> flagged upfront — which brokers need phone verification, email confirmation, or government ID</li>
			<li><strong class="text-text">Relist timelines</strong> so your agent can recommend when to re-check (most brokers relist after 60–180 days)</li>
		</ul>
	</section>

	<section class="space-y-6">
		<h2 class="text-xl font-700">Setup</h2>

		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Claude Desktop / Claude Code</h3>
			<p class="text-text-muted">
				This is the most capable setup. Claude Desktop with computer use can navigate opt-out pages and assist with forms directly. Claude Code can generate and send emails, open URLs, and walk you through each step.
			</p>
			<p class="text-text-muted">
				Add this to your MCP config. In Claude Desktop: Settings &rarr; Developer &rarr; Edit Config. In Claude Code: add to <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">settings.json</code>.
			</p>
			<div class="overflow-hidden rounded-xl border border-border">
				<div class="flex items-center justify-between border-b border-border bg-surface-alt px-4 py-2">
					<span class="text-xs font-medium text-text-muted font-mono">JSON</span>
					<button
						class="rounded px-2 py-1 text-xs text-text-muted transition-colors hover:bg-surface hover:text-text"
						onclick={(e) => {
							const text = `{\n  "mcpServers": {\n    "nah-tools": {\n      "url": "https://nah.tools/mcp"\n    }\n  }\n}`;
							navigator.clipboard.writeText(text);
							const btn = e.currentTarget;
							btn.textContent = 'Copied!';
							setTimeout(() => btn.textContent = 'Copy', 1500);
						}}
					>
						Copy
					</button>
				</div>
				<pre class="overflow-x-auto bg-surface p-4 text-sm font-mono leading-relaxed"><code>{`{
  "mcpServers": {
    "nah-tools": {
      "url": "https://nah.tools/mcp"
    }
  }
}`}</code></pre>
			</div>
			<p class="text-sm text-text-muted">
				No API key, no account, no authentication required.
			</p>
		</div>

		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Any MCP-compatible client</h3>
			<p class="text-text-muted">
				The server URL is <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">https://nah.tools/mcp</code>. Point any client that supports MCP's streamable HTTP transport at it. No auth headers, no setup beyond the URL.
			</p>
		</div>

		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Claude.ai (Connectors) — limited</h3>
			<p class="text-text-muted">
				You can add this as a connector in Claude.ai, but without browser access the agent can't navigate opt-out pages or submit forms. It's still useful for generating removal emails and getting step-by-step guidance you follow manually.
			</p>
			<ol class="list-decimal space-y-2 pl-6 text-text-muted">
				<li>Open <a href="https://claude.ai" class="text-accent underline hover:text-accent-hover">claude.ai</a> &rarr; Settings &rarr; Connectors</li>
				<li>Click <strong class="text-text">Add custom connector</strong></li>
				<li>Name: <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">nah-tools</code></li>
				<li>URL: <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">https://nah.tools/mcp</code></li>
				<li>Click <strong class="text-text">Add</strong></li>
			</ol>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-700">What to expect</h2>
		<p class="text-text-muted">
			Once connected, tell your agent something like:
		</p>
		<blockquote class="rounded-xl border border-border bg-surface-alt px-5 py-4 text-text italic">
			"Remove my personal data from data brokers. My name is Jane Doe, email jane@example.com, I live in California."
		</blockquote>

		<div class="space-y-4">
			<h3 class="text-base font-semibold">With browser access (Claude Desktop + computer use)</h3>
			<p class="text-text-muted">
				Your agent can navigate opt-out pages, assist with form submissions, and open pre-filled search URLs to verify your listings. It will still need you for CAPTCHAs, email verification clicks, and any step requiring government ID or phone verification. Think supervised automation — the agent does the navigation and data entry, you handle the verification gates.
			</p>
		</div>

		<div class="space-y-4">
			<h3 class="text-base font-semibold">Without browser access (Claude.ai, API)</h3>
			<p class="text-text-muted">
				Your agent becomes a guided assistant. It generates ready-to-send deletion emails with mailto links, gives you step-by-step instructions for each broker, and tells you which brokers to prioritize. You still do the clicking, but the agent handles the research, legal language, and prioritization.
			</p>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-700">Available tools</h2>
		<div class="space-y-3">
			{#each tools as tool}
				<div class="rounded-xl border border-border bg-surface p-4">
					<div class="flex items-baseline gap-2">
						<code class="text-sm font-mono font-700 text-accent">{tool.name}</code>
					</div>
					<p class="mt-1 text-sm text-text-muted">{tool.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-700">Resources</h2>
		<p class="text-text-muted">
			The server also exposes broker data as MCP resources that agents can read directly:
		</p>
		<ul class="list-disc space-y-1 pl-6 text-text-muted">
			<li><code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">nah://brokers</code> — summary list of all brokers</li>
			<li><code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">nah://brokers/{'{broker_id}'}</code> — full details for a specific broker</li>
		</ul>
	</section>

	<section class="space-y-3 rounded-xl border border-border bg-surface-alt p-5">
		<h2 class="text-lg font-700">Built on open-source data</h2>
		<p class="text-sm text-text-muted">
			Our broker database draws from community-maintained opt-out guides, including <a href="https://github.com/nicholasgasior/BADBOOL" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">BADBOOL</a> and <a href="https://github.com/brianreumere/data-brokers" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">brianreumere/data-brokers</a>. Our contribution is the transformation layer: we take those guides and make them machine-actionable — structured data that AI agents can query, filter, and act on. The entire server is <a href="https://github.com/vrennat/nah-tools" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">open source</a>.
		</p>
	</section>
</article>
