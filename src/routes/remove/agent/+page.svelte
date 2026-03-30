<script lang="ts">
	const tools = [
		{
			name: 'list_brokers',
			description: 'List and filter brokers by priority, difficulty, opt-out method, or category. Returns a summary for each broker.'
		},
		{
			name: 'get_broker',
			description: 'Get full details for a specific broker including step-by-step opt-out instructions, URLs, required info, and notes.'
		},
		{
			name: 'get_broker_search_url',
			description: 'Get a pre-filled search URL to check if your data appears on a broker site before opting out.'
		},
		{
			name: 'generate_removal_email',
			description: 'Generate a CCPA or GDPR data deletion request email with the correct legal language, ready to send.'
		},
		{
			name: 'get_removal_plan',
			description: 'Get a prioritized removal plan that deduplicates subsidiaries and estimates the total time required.'
		}
	];
</script>

<svelte:head>
	<title>Automate Data Broker Removal with AI — nah</title>
	<meta
		name="description"
		content="Connect Claude or any MCP-compatible AI agent to nah.tools and automate removing your personal data from 25+ data brokers."
	/>
</svelte:head>

<article class="mx-auto max-w-3xl space-y-8">
	<header class="space-y-3">
		<p class="text-sm font-medium text-accent">
			<a href="/remove" class="hover:underline">&larr; Back to manual removal</a>
		</p>
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">
			Automate your data removal with AI.
		</h1>
		<p class="text-lg text-text-muted">
			Connect an AI agent to our MCP server and let it handle the tedious work of opting out from data brokers — generating emails, navigating forms, and tracking progress.
		</p>
	</header>

	<section class="space-y-3">
		<h2 class="text-xl font-bold">What is this?</h2>
		<p class="text-text-muted">
			<a href="https://modelcontextprotocol.io" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">Model Context Protocol (MCP)</a>
			is an open standard that lets AI agents use external tools. Our MCP server gives any compatible agent access to our full database of 25+ data brokers — their opt-out procedures, search URLs, legal email templates, and a prioritized removal plan.
		</p>
		<p class="text-text-muted">
			Instead of manually copying emails and clicking through opt-out forms one by one, your AI agent does it for you. It knows which brokers to tackle first, which opt-outs cover multiple subsidiaries, and which ones require phone verification.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-bold">Connect with Claude</h2>
		<p class="text-text-muted">
			The fastest way to get started is adding nah.tools as a connector in Claude.
		</p>

		<h3 class="mt-2 text-lg font-semibold">Claude.ai (Connectors)</h3>
		<ol class="list-decimal space-y-2 pl-6 text-text-muted">
			<li>Open <a href="https://claude.ai" class="text-accent underline hover:text-accent-hover">claude.ai</a> &rarr; Settings &rarr; Connectors</li>
			<li>Click <strong class="text-text">Add custom connector</strong></li>
			<li>Name: <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">nah-tools</code></li>
			<li>URL: <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">https://nah.tools/mcp</code></li>
			<li>Click <strong class="text-text">Add</strong></li>
		</ol>

		<h3 class="mt-6 text-lg font-semibold">Claude Code / Claude Desktop</h3>
		<p class="text-text-muted">
			Add this to your MCP client configuration. In Claude Desktop, go to Settings &rarr; Developer &rarr; Edit Config. In Claude Code, add it to your <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">settings.json</code>.
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
			No API key, no account, no authentication required. Works with any MCP-compatible client.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-bold">What your agent can do</h2>
		<p class="text-text-muted">
			Once connected, just tell your agent something like:
		</p>
		<blockquote class="rounded-xl border border-border bg-surface-alt px-5 py-4 text-text italic">
			"Remove my personal data from data brokers. My name is Jane Doe, email jane@example.com, I live in California."
		</blockquote>
		<p class="text-text-muted">
			Your agent will:
		</p>
		<ol class="list-decimal space-y-2 pl-6 text-text-muted">
			<li>Get a prioritized removal plan, starting with the highest-risk brokers</li>
			<li>Check each broker's search page to verify your data is listed</li>
			<li>Generate legally-grounded CCPA or GDPR deletion emails</li>
			<li>Walk you through opt-out forms step by step (or fill them directly with browser access)</li>
			<li>Flag brokers that need phone verification or government ID</li>
			<li>Track progress and suggest re-checking brokers that relist data</li>
		</ol>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-bold">Available tools</h2>
		<div class="space-y-3">
			{#each tools as tool}
				<div class="rounded-xl border border-border bg-surface p-4">
					<div class="flex items-baseline gap-2">
						<code class="text-sm font-mono font-bold text-accent">{tool.name}</code>
					</div>
					<p class="mt-1 text-sm text-text-muted">{tool.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-bold">Resources</h2>
		<p class="text-text-muted">
			The server also exposes broker data as MCP resources that agents can read directly:
		</p>
		<ul class="list-disc space-y-1 pl-6 text-text-muted">
			<li><code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">nah://brokers</code> — summary list of all brokers</li>
			<li><code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm font-mono">nah://brokers/{'{broker_id}'}</code> — full details for a specific broker</li>
		</ul>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-bold">Best with browser access</h2>
		<p class="text-text-muted">
			The most powerful setup pairs this MCP server with browser automation (like Claude with computer use). The agent can navigate opt-out pages, fill forms, and handle CAPTCHAs — turning a multi-hour manual process into a supervised automated one. Without browser access, the agent acts as a guided assistant: generating emails, providing step-by-step instructions, and tracking what's done.
		</p>
	</section>

	<div class="rounded-xl border border-border bg-surface-alt p-5 text-sm text-text-muted">
		<p>
			<strong class="text-text">Privacy note:</strong> The MCP server is stateless — it serves broker data and generates emails based on the information you provide in each request. No personal data is stored, logged, or transmitted beyond the immediate response. The server source code is
			<a href="https://github.com/vrennat/nah-tools" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">open source</a>.
		</p>
	</div>
</article>
