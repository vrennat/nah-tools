<script lang="ts">
	import type { UserInfo, BrokerFilters, SortBy, RemovalStatus, ProgressEntry } from '$remove/types';
	import { brokers } from '$remove/brokers';
	import { filterBrokers, sortBrokers } from '$remove/filters';
	import { loadProgress, updateProgress, clearProgress } from '$remove/storage';
	import UserInfoForm from '$components/remove/UserInfoForm.svelte';
	import DropCallout from '$components/remove/DropCallout.svelte';
	import BrokerFilterBar from '$components/remove/BrokerFilterBar.svelte';
	import ProgressSummary from '$components/remove/ProgressSummary.svelte';
	import BrokerCard from '$components/remove/BrokerCard.svelte';

	let userInfo: UserInfo = $state({
		firstName: '',
		lastName: '',
		email: '',
		state: '',
		address: '',
		city: '',
		zip: '',
		phone: '',
	});

	let filters: BrokerFilters = $state({
		method: 'all',
		difficulty: 'all',
		priority: 'all',
		category: 'all',
		status: 'all',
	});

	let sort: SortBy = $state('priority');
	let progress: Record<string, ProgressEntry> = $state(loadProgress());

	let filteredBrokers = $derived(
		sortBrokers(filterBrokers(brokers, filters, progress), sort, progress)
	);

	function handleStatusChange(brokerId: string, status: RemovalStatus) {
		updateProgress(brokerId, status);
		progress = loadProgress();
	}

	function handleClearProgress() {
		clearProgress();
		progress = {};
	}

	let showClearConfirm = $state(false);
</script>

<svelte:head>
	<title>Remove Your Data from Data Brokers — nah</title>
	<meta
		name="description"
		content="Free, open-source data broker removal tool. Generate opt-out requests and follow step-by-step guides to remove your personal information from 25+ data brokers. 100% client-side."
	/>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'nah — Data Broker Removal Tool',
		url: 'https://nah.tools/remove',
		description: 'Free, open-source tool to remove your personal information from data brokers. Generates opt-out emails and provides step-by-step removal guides.',
		applicationCategory: 'UtilityApplication',
		operatingSystem: 'Any',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
		},
		creator: {
			'@type': 'Organization',
			name: 'nah',
			url: 'https://nah.tools',
		},
	})}</script>`}
</svelte:head>

<div class="space-y-8">
	<!-- Hero -->
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Remove your data <span class="text-accent">from the internet.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Generate opt-out requests for data brokers. Everything runs in your browser — we never see your information.
		</p>
		<div class="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success">
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
			</svg>
			100% client-side — zero data sent to our servers
		</div>
		<p class="mt-3 text-sm text-text-muted">
			Want to automate this? <a href="/mcp" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">Connect an AI agent</a> to handle it for you.
		</p>
	</section>

	<!-- User info form -->
	<UserInfoForm bind:userInfo />

	<!-- DROP callout for California residents -->
	{#if userInfo.state === 'CA'}
		<DropCallout />
	{/if}

	<!-- Progress + Filters -->
	<ProgressSummary {brokers} {progress} />

	<BrokerFilterBar bind:filters bind:sort />

	<!-- Broker list -->
	<p class="text-sm text-text-muted">Click any broker below to expand it and start the removal process.</p>
	<div class="space-y-3">
		{#each filteredBrokers as broker, i (broker.id)}
			<BrokerCard
				{broker}
				{userInfo}
				progress={progress[broker.id]}
				onStatusChange={handleStatusChange}
				initialExpanded={i === 0}
			/>
		{/each}

		{#if filteredBrokers.length === 0}
			<div class="rounded-xl border border-border bg-surface p-8 text-center">
				<p class="text-text-muted">No brokers match your current filters.</p>
			</div>
		{/if}
	</div>

	<!-- Clear progress -->
	{#if Object.keys(progress).length > 0}
		<div class="text-center">
			{#if showClearConfirm}
				<p class="mb-2 text-sm text-text-muted">Are you sure? This will reset all progress.</p>
				<div class="flex justify-center gap-2">
					<button
						onclick={handleClearProgress}
						class="rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-error/90"
					>
						Yes, clear all progress
					</button>
					<button
						onclick={() => (showClearConfirm = false)}
						class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-alt"
					>
						Cancel
					</button>
				</div>
			{:else}
				<button
					onclick={() => (showClearConfirm = true)}
					class="text-sm text-text-muted transition-colors hover:text-text"
				>
					Clear all progress
				</button>
			{/if}
		</div>
	{/if}

	<!-- Legal disclaimer -->
	<div class="rounded-xl border border-border bg-surface-alt p-4 text-center text-xs text-text-muted">
		<p>
			This tool generates requests based on privacy laws including the California Consumer Privacy Act (CCPA)
			and the EU General Data Protection Regulation (GDPR). It is not legal advice and does not guarantee
			removal. You are submitting these requests yourself — nah.tools does not act as your authorized agent.
		</p>
	</div>
</div>
