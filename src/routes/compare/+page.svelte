<script lang="ts">
	const features = [
		{ name: 'Price (paid plans)', nah: '$0', qrpro: '$60-450/yr', qrtiger: '$84-444/yr', flowcode: '$60-3,000/yr', uniqode: '$60-588/yr' },
		{ name: 'Static QR codes', nah: true, qrpro: true, qrtiger: true, flowcode: false, uniqode: true, nahNote: 'Unlimited', flowcodeNote: 'All dynamic' },
		{ name: 'No signup for static codes', nah: true, qrpro: false, qrtiger: true, flowcode: false, uniqode: true, qrproNote: 'Account required', qrtigerNote: 'Free static', uniqodeNote: 'Free static' },
		{ name: 'Static codes never expire', nah: true, qrpro: true, qrtiger: true, flowcode: false, uniqode: true, qrproNote: 'Free static only', qrtigerNote: 'Free static only', flowcodeNote: 'All dynamic', uniqodeNote: 'Free static only' },
		{ name: 'Dynamic codes without subscription', nah: true, qrpro: false, qrtiger: false, flowcode: false, uniqode: false, nahNote: 'Free', qrproNote: '14-day trial', qrtigerNote: 'Trial expiry', uniqodeNote: 'Trial expiry' },
		{ name: 'Custom colors & dot styles', nah: true, qrpro: false, qrtiger: true, flowcode: true, uniqode: true, qrproNote: 'Paid plans' },
		{ name: 'Logo embedding', nah: true, qrpro: false, qrtiger: true, flowcode: true, uniqode: true, qrproNote: 'Paid plans', qrtigerNote: 'Free static' },
		{ name: 'SVG export', nah: true, qrpro: false, qrtiger: false, flowcode: false, uniqode: true, qrproNote: 'Paid plans', qrtigerNote: 'Paid plans', uniqodeNote: 'Free static' },
		{ name: 'High-res PNG', nah: true, qrpro: false, qrtiger: false, flowcode: false, uniqode: false, nahNote: 'Any size', qrproNote: 'Paid plans', qrtigerNote: 'Paid plans', flowcodeNote: 'Paid', uniqodeNote: 'Paid plans' },
		{ name: 'Dynamic QR codes', nah: true, qrpro: true, qrtiger: true, flowcode: true, uniqode: true, nahNote: 'Free', qrproNote: '$5-38/mo', qrtigerNote: '$7-37/mo', flowcodeNote: '$5-250/mo', uniqodeNote: '$5-49/mo' },
		{ name: 'Batch generation', nah: true, qrpro: false, qrtiger: false, flowcode: false, uniqode: false, qrproNote: 'Paid plans', qrtigerNote: 'Paid plans', flowcodeNote: 'Enterprise', uniqodeNote: 'Paid plans' },
		{ name: 'No ads or watermarks', nah: true, qrpro: false, qrtiger: false, flowcode: true, uniqode: true, qrproNote: 'Paid only', qrtigerNote: 'Paid only' },
		{ name: 'Open source', nah: true, qrpro: false, qrtiger: false, flowcode: false, uniqode: false },
		{ name: 'Works offline', nah: true, qrpro: false, qrtiger: false, flowcode: false, uniqode: false },
		{ name: 'Privacy-first (client-side)', nah: true, qrpro: false, qrtiger: false, flowcode: false, uniqode: false, qrproNote: 'Server-side', qrtigerNote: 'Server-side', flowcodeNote: 'Server-side', uniqodeNote: 'Server-side' },
		{ name: 'No cookies', nah: true, qrpro: false, qrtiger: false, flowcode: false, uniqode: false },
	];

	const competitors = [
		{ key: 'qrpro', name: 'QR Code Generator Pro' },
		{ key: 'qrtiger', name: 'QR Tiger' },
		{ key: 'flowcode', name: 'Flowcode' },
		{ key: 'uniqode', name: 'Uniqode' },
	] as const;

	type CompKey = 'qrpro' | 'qrtiger' | 'flowcode' | 'uniqode';
</script>

<svelte:head>
	<title>Compare QR Code Generators — Nah Tools vs Paid Alternatives</title>
	<meta
		name="description"
		content="See how Nah Tools compares to QR Code Generator Pro, QR Tiger, Flowcode, and Uniqode. Every feature, side by side."
	/>
</svelte:head>

<div class="space-y-16 py-8">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight text-text sm:text-5xl md:text-6xl">
			Compare QR Code Generators
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			How Nah Tools stacks up against paid QR code generators, side by side.
			No signup, no trial, no catch.
		</p>
	</section>

	<section>
		<div class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
			<table class="w-full min-w-[700px] border-collapse text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="sticky left-0 z-10 bg-surface py-4 pr-4 text-left font-semibold text-text">
							Feature
						</th>
						<th class="bg-accent/10 px-4 py-4 text-center font-bold text-accent">
							Nah Tools
							<span class="block text-xs font-normal text-accent/80">Free forever</span>
						</th>
						{#each competitors as comp}
							<th class="px-4 py-4 text-center font-semibold text-text-muted">
								{comp.name}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each features as feature, i}
						<tr class="border-b border-border {i % 2 === 0 ? 'bg-surface' : 'bg-surface-alt/30'}">
							<td class="sticky left-0 z-10 py-3 pr-4 font-medium text-text {i % 2 === 0 ? 'bg-surface' : 'bg-surface-alt/30'}">
								{feature.name}
							</td>
							<td class="bg-accent/5 px-4 py-3 text-center">
								{#if typeof feature.nah === 'string'}
									<span class="font-semibold text-text">{feature.nah}</span>
								{:else if feature.nah}
									<span class="text-lg text-success">&#10003;</span>
									{#if feature.nahNote}
										<span class="block text-xs text-text-muted">{feature.nahNote}</span>
									{/if}
								{:else}
									<span class="text-lg text-error">&#10005;</span>
								{/if}
							</td>
							{#each competitors as comp}
								{@const key = comp.key as CompKey}
								{@const val = feature[key]}
								{@const noteKey = `${key}Note` as `${CompKey}Note`}
								{@const note = (feature as any)[noteKey]}
								<td class="px-4 py-3 text-center">
									{#if typeof val === 'string'}
										<span class="text-text-muted">{val}</span>
									{:else if val}
										<span class="text-lg text-success">&#10003;</span>
										{#if note}
											<span class="block text-xs text-text-muted">{note}</span>
										{/if}
									{:else}
										<span class="text-lg text-error">&#10005;</span>
										{#if note}
											<span class="block text-xs text-text-muted">{note}</span>
										{/if}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="mt-4 text-xs text-text-muted">
			Pricing and feature data based on publicly listed plans as of early 2026. Competitors offer free static QR tools with varying feature sets; paid plan pricing shown is for dynamic QR and advanced features. Check each provider's current pricing page for the latest.
		</p>
	</section>

	<section>
		<h2 class="mb-4 text-2xl font-bold text-text">What We Don't Offer</h2>
		<p class="mb-6 leading-relaxed text-text-muted">
			We serve 90% of QR code use cases for free. The remaining 10% involves enterprise features
			that genuinely justify paid tooling. We won't pretend those features are trivial — but we
			will point out that most users are paying enterprise prices for consumer-grade needs.
		</p>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="rounded-lg border border-border bg-surface p-4">
				<p class="mb-1 font-semibold text-text">GPS scan tracking</p>
				<p class="text-sm text-text-muted">
					We don't track where people scan your codes. Enterprise marketing teams running
					geo-targeted campaigns need this. Most people don't.
				</p>
			</div>
			<div class="rounded-lg border border-border bg-surface p-4">
				<p class="mb-1 font-semibold text-text">Retargeting pixels</p>
				<p class="text-sm text-text-muted">
					Surveillance-based ad targeting through QR scans is incompatible with our values.
					Digital advertisers use this. You probably shouldn't.
				</p>
			</div>
			<div class="rounded-lg border border-border bg-surface p-4">
				<p class="mb-1 font-semibold text-text">CRM integrations</p>
				<p class="text-sm text-text-muted">
					Salesforce, HubSpot, and similar integrations require ongoing API maintenance per
					platform. Enterprise sales teams need these.
				</p>
			</div>
			<div class="rounded-lg border border-border bg-surface p-4">
				<p class="mb-1 font-semibold text-text">Team management & SSO</p>
				<p class="text-sm text-text-muted">
					Multi-user access controls, role permissions, and single sign-on add complexity
					that only matters for companies with 10+ people managing QR codes.
				</p>
			</div>
			<div class="rounded-lg border border-border bg-surface p-4">
				<p class="mb-1 font-semibold text-text">White-label custom domains</p>
				<p class="text-sm text-text-muted">
					Per-user DNS configuration for branded redirect URLs. Agencies reselling QR
					services need this.
				</p>
			</div>
			<div class="rounded-lg border border-border bg-surface p-4">
				<p class="mb-1 font-semibold text-text">SOC 2 / HIPAA compliance</p>
				<p class="text-sm text-text-muted">
					Compliance certifications cost $20K+ per year. Healthcare and finance companies
					require them. A wedding invitation does not.
				</p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="mb-4 text-2xl font-bold text-text">How We Afford This</h2>
		<div class="rounded-xl border border-border bg-surface p-6">
			<p class="mb-4 font-semibold text-text">
				"How is this free? What's the catch?"
			</p>
			<p class="mb-4 leading-relaxed text-text-muted">
				There is no catch. Here's how the economics work:
			</p>
			<p class="mb-4 leading-relaxed text-text-muted">
				<strong class="text-text">Static QR codes</strong> are generated entirely in your browser.
				Our server never sees your data and never does any work. Hosting static web pages on
				Cloudflare is free — unlimited bandwidth, unlimited requests, forever.
			</p>
			<p class="mb-4 leading-relaxed text-text-muted">
				<strong class="text-text">Dynamic QR codes</strong> use a tiny redirect server.
				Cloudflare Workers costs us $5/month for up to 10 million redirects. The domain costs
				$28.20/year. At our current usage, the total monthly cost of running nah.tools is less
				than a cup of coffee.
			</p>
			<p class="mb-4 leading-relaxed text-text-muted">
				The source code is open on GitHub. There are no investors to satisfy, no growth targets
				to hit, no reason to ever add paywalls, ads, or dark patterns.
			</p>
			<p class="leading-relaxed text-text-muted">
				If you'd like to support the project, you can star the
				<a href="https://github.com/tannerbroberts/nah-tools" class="text-accent underline hover:text-accent-hover">GitHub repo</a>
				or share it with someone who needs a QR code.
			</p>
		</div>
	</section>

	<section class="rounded-xl border border-border bg-surface p-8 text-center">
		<h2 class="mb-2 text-2xl font-bold text-text">Ready to try it?</h2>
		<p class="mb-6 text-text-muted">
			Create a QR code in seconds. No signup, no credit card, no trial timer.
		</p>
		<a
			href="/qr"
			class="inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-hover"
		>
			Create a free QR code
		</a>
	</section>
</div>
