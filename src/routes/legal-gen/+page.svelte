<script lang="ts">
</script>

<svelte:head>
	<title>Free Privacy Policy and ToS Generator — nah</title>
	<meta name="description" content="Generate professional privacy policies, terms of service, cookie policies, and DMCA notices. Free, no sign-up required." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-surface to-surface-alt">
	<div class="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
		<!-- Hero -->
		<div class="text-center mb-16">
			<h1 class="text-4xl sm:text-5xl font-bold text-text mb-4 font-display">
				Free Legal Document Generator
			</h1>
			<p class="text-lg text-text-muted max-w-2xl mx-auto mb-6">
				Create professional privacy policies, terms of service, cookie policies, and DMCA notices in minutes. No sign-up required.
			</p>
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="text-sm font-medium">100% private. Runs in your browser.</span>
			</div>
		</div>

		<!-- Disclaimer Banner -->
		<div class="mb-12 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
			<div class="flex gap-3">
				<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
						clip-rule="evenodd"
					/>
				</svg>
				<div>
					<strong class="block">Important Disclaimer</strong>
					<p class="text-sm mt-1">These templates are starting points, not legal advice. Have a lawyer review documents for your specific situation.</p>
				</div>
			</div>
		</div>

		<!-- Document Cards -->
		<div class="grid md:grid-cols-2 gap-6">
			<!-- Privacy Policy -->
			<a
				href="/legal-gen/privacy-policy"
				class="group p-6 rounded-xl bg-surface border border-border hover:border-accent hover:shadow-lg transition-all"
			>
				<div class="text-3xl mb-4">
					<svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-text mb-2 group-hover:text-accent transition-colors">
					Privacy Policy
				</h2>
				<p class="text-text-muted text-sm mb-4">
					Explain how you collect, use, and protect user data. Includes GDPR and CCPA compliance.
				</p>
				<div class="flex items-center text-accent text-sm font-medium">
					Generate <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</div>
			</a>

			<!-- Terms of Service -->
			<a
				href="/legal-gen/terms-of-service"
				class="group p-6 rounded-xl bg-surface border border-border hover:border-accent hover:shadow-lg transition-all"
			>
				<div class="text-3xl mb-4">
					<svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-text mb-2 group-hover:text-accent transition-colors">
					Terms of Service
				</h2>
				<p class="text-text-muted text-sm mb-4">
					Protect your business with clear usage terms, liability limits, and dispute resolution.
				</p>
				<div class="flex items-center text-accent text-sm font-medium">
					Generate <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</div>
			</a>

			<!-- Cookie Policy -->
			<a
				href="/legal-gen/cookie-policy"
				class="group p-6 rounded-xl bg-surface border border-border hover:border-accent hover:shadow-lg transition-all"
			>
				<div class="text-3xl mb-4">
					<svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-text mb-2 group-hover:text-accent transition-colors">
					Cookie Policy
				</h2>
				<p class="text-text-muted text-sm mb-4">
					Disclose your cookie practices and tracking technologies. GDPR and CCPA compliant.
				</p>
				<div class="flex items-center text-accent text-sm font-medium">
					Generate <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</div>
			</a>

			<!-- DMCA Notice -->
			<a
				href="/legal-gen/dmca-notice"
				class="group p-6 rounded-xl bg-surface border border-border hover:border-accent hover:shadow-lg transition-all"
			>
				<div class="text-3xl mb-4">
					<svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v2m0-6V9m0 4V7m0 0v2m6-12H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2z" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-text mb-2 group-hover:text-accent transition-colors">
					DMCA Notice
				</h2>
				<p class="text-text-muted text-sm mb-4">
					Establish your copyright compliance procedures and handling of infringement claims.
				</p>
				<div class="flex items-center text-accent text-sm font-medium">
					Generate <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</div>
			</a>
		</div>

		<!-- Footer Info -->
		<div class="mt-16 pt-8 border-t border-border">
			<div class="grid md:grid-cols-3 gap-8 text-center md:text-left">
				<div>
					<h3 class="font-semibold text-text mb-2">No Costs</h3>
					<p class="text-sm text-text-muted">Completely free. No hidden fees or paid plans.</p>
				</div>
				<div>
					<h3 class="font-semibold text-text mb-2">No Data Collection</h3>
					<p class="text-sm text-text-muted">Everything is processed locally in your browser.</p>
				</div>
				<div>
					<h3 class="font-semibold text-text mb-2">Professional Quality</h3>
					<p class="text-sm text-text-muted">Templates that work for most businesses.</p>
				</div>
			</div>
		</div>
	</div>
</div>
