<script lang="ts">
	interface ToolGroup {
		category: string;
		description: string;
		tools: { name: string; description: string }[];
	}

	const toolGroups: ToolGroup[] = [
		{
			category: 'Data Broker Removal',
			description: 'Find, filter, and opt out of 25+ data brokers with structured opt-out procedures and legal email templates.',
			tools: [
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
					description: 'Generate deletion emails for every email-accepting broker at once. Takes your info once, returns all emails with mailto links.'
				}
			]
		},
		{
			category: 'QR Code',
			description: 'Encode data for QR codes — URLs, WiFi credentials, contact cards, email, phone, SMS, and plain text.',
			tools: [
				{
					name: 'encode_qr',
					description: 'Encode data into a QR-compatible string for any content type: URL, text, WiFi, vCard, email, phone, or SMS. Returns the raw encoded string.'
				}
			]
		},
		{
			category: 'PDF Processing',
			description: 'Full server-side PDF manipulation — merge, split, rotate, watermark, encrypt, compress, and more. Files passed as base64.',
			tools: [
				{
					name: 'pdf_get_info',
					description: 'Get page count, page dimensions, and document metadata (title, author, subject) from a PDF.'
				},
				{
					name: 'pdf_merge',
					description: 'Merge multiple PDF files into a single document.'
				},
				{
					name: 'pdf_split',
					description: 'Split a PDF into separate documents by page ranges.'
				},
				{
					name: 'pdf_rotate',
					description: 'Rotate specific pages by 90°, 180°, or 270° clockwise.'
				},
				{
					name: 'pdf_remove_pages',
					description: 'Remove specific pages from a PDF.'
				},
				{
					name: 'pdf_reorder',
					description: 'Reorder pages in a PDF by specifying the new page sequence.'
				},
				{
					name: 'pdf_add_watermark',
					description: 'Add a text watermark to all pages with configurable font size, color, opacity, and rotation.'
				},
				{
					name: 'pdf_add_page_numbers',
					description: 'Add page numbers to all pages with configurable position, format, and starting number.'
				},
				{
					name: 'pdf_protect',
					description: 'Add password protection and permission restrictions (printing, copying, modifying).'
				},
				{
					name: 'pdf_unlock',
					description: 'Remove password protection from a PDF by providing the password.'
				},
				{
					name: 'pdf_flatten',
					description: 'Flatten form fields and annotations into static content.'
				},
				{
					name: 'pdf_crop',
					description: 'Crop margins from PDF pages by specifying trim values in points.'
				},
				{
					name: 'pdf_compress',
					description: 'Reduce file size by stripping metadata and using object streams.'
				},
				{
					name: 'pdf_set_metadata',
					description: 'Set or update title, author, subject, and keywords.'
				}
			]
		},
		{
			category: 'PowerPoint Processing',
			description: 'Server-side PPTX manipulation — merge, split, compress, extract text, add watermarks, and more. Files passed as base64.',
			tools: [
				{
					name: 'pptx_get_info',
					description: 'Get slide count and document metadata from a PPTX file.'
				},
				{
					name: 'pptx_extract_text',
					description: 'Extract all text content from a PowerPoint file, organized by slide.'
				},
				{
					name: 'pptx_merge',
					description: 'Merge multiple PowerPoint files into one presentation.'
				},
				{
					name: 'pptx_split',
					description: 'Split a PowerPoint file into multiple files by slide ranges.'
				},
				{
					name: 'pptx_compress',
					description: 'Reduce file size by compressing images and removing unnecessary data.'
				},
				{
					name: 'pptx_remove_notes',
					description: 'Strip all speaker notes from a presentation.'
				},
				{
					name: 'pptx_remove_animations',
					description: 'Strip all animations and transitions from slides.'
				},
				{
					name: 'pptx_add_watermark',
					description: 'Add a text watermark to all slides.'
				},
				{
					name: 'pptx_set_metadata',
					description: 'Set or update title, author, subject, and other document properties.'
				}
			]
		},
		{
			category: 'Invoice Calculations',
			description: 'Calculate invoice totals with support for multi-tax, compound tax, per-item discounts, and tax-inclusive pricing.',
			tools: [
				{
					name: 'invoice_calculate',
					description: 'Calculate invoice totals from line items — returns detailed breakdown of subtotals, discounts, taxes, and grand total.'
				}
			]
		}
	];
</script>

<svelte:head>
	<title>MCP Server — nah.tools</title>
	<meta
		name="description"
		content="Give your AI agent PDF processing, PowerPoint tools, QR encoding, invoice calculations, and data broker removal. Open-source MCP server — no account, no tracking, no data stored."
	/>
</svelte:head>

<article class="mx-auto max-w-3xl space-y-8">
	<header class="space-y-3">
		<p class="text-sm font-medium text-accent">
			<a href="/" class="hover:underline">&larr; Back to tools</a>
		</p>
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">
			Every tool on nah.tools, available to your AI agent.
		</h1>
		<p class="text-lg text-text-muted">
			This MCP server gives any AI agent access to PDF processing, PowerPoint manipulation, QR code encoding, invoice calculations, and data broker removal — {toolGroups.reduce((sum, g) => sum + g.tools.length, 0)} tools in total. Connect it once and your agent can merge PDFs, extract text from presentations, calculate invoices, generate QR codes, and walk you through data broker opt-outs.
		</p>
	</header>

	<section class="space-y-4 rounded-xl border border-accent/30 bg-accent/5 p-5">
		<h2 class="text-xl font-bold">No data stored. No data logged. No account.</h2>
		<p class="text-text-muted">
			The MCP server is completely stateless. PDF and PPTX files are processed in memory and discarded immediately — nothing is stored, logged, or transmitted beyond the immediate response. There is no account, no API key, and no tracking.
		</p>
		<p class="text-text-muted">
			The server source code is <a href="https://github.com/vrennat/nah-tools" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">open source</a>.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-bold">What is MCP?</h2>
		<p class="text-text-muted">
			<a href="https://modelcontextprotocol.io" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">Model Context Protocol</a>
			is an open standard that lets AI agents use external tools. Instead of building "an AI product," we built a resource layer — your existing AI (Claude, or any MCP-compatible agent) connects to our server and gains access to structured opt-out data it didn't have before.
		</p>
		<p class="text-text-muted">
			The intelligence is your agent's. The opt-out data is ours.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-bold">What the server can do</h2>
		<ul class="list-disc space-y-2 pl-6 text-text-muted">
			<li><strong class="text-text">PDF processing</strong> — merge, split, rotate, reorder, remove pages, add watermarks, add page numbers, encrypt/decrypt, flatten forms, crop, compress, set metadata</li>
			<li><strong class="text-text">PowerPoint processing</strong> — merge, split, compress, extract text, remove speaker notes, remove animations, add watermarks, set metadata</li>
			<li><strong class="text-text">QR code encoding</strong> — encode URLs, WiFi credentials, contact cards (vCard), emails, phone numbers, SMS, and plain text into QR-compatible strings</li>
			<li><strong class="text-text">Invoice calculations</strong> — calculate totals with line items, per-item discounts, multi-tax and compound tax configurations, and tax-inclusive pricing</li>
			<li><strong class="text-text">Data broker removal</strong> — search 25+ brokers, generate CCPA/GDPR deletion emails, get prioritized removal plans with subsidiary deduplication</li>
		</ul>
	</section>

	<section class="space-y-6">
		<h2 class="text-xl font-bold">Setup</h2>

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
		<h2 class="text-xl font-bold">What to expect</h2>
		<p class="text-text-muted">
			Once connected, your agent can handle requests like:
		</p>
		<div class="space-y-2">
			<blockquote class="rounded-xl border border-border bg-surface-alt px-5 py-4 text-text italic">
				"Merge these three PDFs and add page numbers."
			</blockquote>
			<blockquote class="rounded-xl border border-border bg-surface-alt px-5 py-4 text-text italic">
				"Extract text from this PowerPoint presentation."
			</blockquote>
			<blockquote class="rounded-xl border border-border bg-surface-alt px-5 py-4 text-text italic">
				"Calculate an invoice with 20% VAT for these line items."
			</blockquote>
			<blockquote class="rounded-xl border border-border bg-surface-alt px-5 py-4 text-text italic">
				"Remove my personal data from data brokers."
			</blockquote>
		</div>
		<p class="text-sm text-text-muted">
			File-based tools (PDF, PPTX) accept and return base64-encoded data. Agents with file system access (Claude Code, Claude Desktop) can read files, encode them, process them, and write the results back automatically.
		</p>
	</section>

	<section class="space-y-6">
		<h2 class="text-xl font-bold">Available tools ({toolGroups.reduce((sum, g) => sum + g.tools.length, 0)})</h2>
		{#each toolGroups as group}
			<div class="space-y-3">
				<div>
					<h3 class="text-lg font-semibold">{group.category}</h3>
					<p class="text-sm text-text-muted">{group.description}</p>
				</div>
				<div class="space-y-2">
					{#each group.tools as tool}
						<div class="rounded-xl border border-border bg-surface p-4">
							<code class="text-sm font-mono font-bold text-accent">{tool.name}</code>
							<p class="mt-1 text-sm text-text-muted">{tool.description}</p>
						</div>
					{/each}
				</div>
			</div>
		{/each}
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

	<section class="space-y-3 rounded-xl border border-border bg-surface-alt p-5">
		<h2 class="text-lg font-bold">Built on open-source data</h2>
		<p class="text-sm text-text-muted">
			Our broker database draws from community-maintained opt-out guides, including <a href="https://github.com/nicholasgasior/BADBOOL" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">BADBOOL</a> and <a href="https://github.com/brianreumere/data-brokers" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">brianreumere/data-brokers</a>. Our contribution is the transformation layer: we take those guides and make them machine-actionable — structured data that AI agents can query, filter, and act on. The entire server is <a href="https://github.com/vrennat/nah-tools" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">open source</a>.
		</p>
	</section>
</article>
