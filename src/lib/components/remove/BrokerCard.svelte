<script lang="ts">
	import type { Broker, UserInfo, RemovalStatus, ProgressEntry } from '$remove/types';
	import StatusBadge from './StatusBadge.svelte';
	import DifficultyBadge from './DifficultyBadge.svelte';
	import PriorityBadge from './PriorityBadge.svelte';
	import EmailPreview from './EmailPreview.svelte';
	import StepWalkthrough from './StepWalkthrough.svelte';

	let {
		broker,
		userInfo,
		progress,
		onStatusChange,
	}: {
		broker: Broker;
		userInfo: UserInfo;
		progress: ProgressEntry | undefined;
		onStatusChange: (brokerId: string, status: RemovalStatus) => void;
	} = $props();

	let expanded = $state(false);
	let status = $derived<RemovalStatus>(progress?.status ?? 'not-started');

	let hasEmail = $derived(
		broker.optOutMethod === 'email' || broker.optOutMethod === 'email+form'
	);
	let hasForm = $derived(
		broker.optOutMethod === 'form' || broker.optOutMethod === 'email+form'
	);

	let hasUserInfo = $derived(userInfo.firstName && userInfo.lastName && userInfo.email);

	const categoryLabels: Record<string, string> = {
		'people-search': 'People Search',
		'data-broker': 'Data Broker',
		marketing: 'Marketing',
		'background-check': 'Background Check',
		financial: 'Financial',
	};
</script>

<div class="rounded-xl border border-border bg-surface shadow-sm transition-all" class:border-accent={expanded}>
	<!-- Collapsed header -->
	<button
		onclick={() => (expanded = !expanded)}
		aria-expanded={expanded}
		class="flex w-full items-center gap-3 p-4 text-left"
	>
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				<h3 class="truncate font-semibold text-text">{broker.name}</h3>
				<span class="shrink-0 rounded bg-surface-alt px-1.5 py-0.5 text-xs text-text-muted">
					{categoryLabels[broker.category] ?? broker.category}
				</span>
			</div>
			<div class="mt-1 flex flex-wrap items-center gap-2">
				<PriorityBadge priority={broker.priority} />
				<DifficultyBadge difficulty={broker.difficulty} />
				<StatusBadge {status} />
				{#if broker.optOutMethod === 'email' || broker.optOutMethod === 'email+form'}
					<span class="inline-flex items-center gap-1 text-xs text-text-muted">
						<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						Email
					</span>
				{/if}
				{#if broker.optOutMethod === 'form' || broker.optOutMethod === 'email+form'}
					<span class="inline-flex items-center gap-1 text-xs text-text-muted">
						<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Form
					</span>
				{/if}
				{#if broker.verificationMethod === 'phone'}
					<span class="inline-flex items-center gap-1 text-xs text-warning">
						<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
						</svg>
						Phone
					</span>
				{/if}
			</div>
		</div>
		<svg
			class="h-5 w-5 shrink-0 text-text-muted transition-transform {expanded ? 'rotate-180' : ''}"
			fill="none" stroke="currentColor" viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Expanded content -->
	{#if expanded}
		<div class="border-t border-border px-4 pb-4 pt-3">
			{#if broker.notes}
				<p class="mb-3 text-sm text-text-muted">{broker.notes}</p>
			{/if}

			{#if broker.parentCompany}
				<p class="mb-3 text-xs text-text-muted">
					Parent company: {broker.parentCompany}
					{#if broker.subsidiaries?.length}
						— opt-out may also cover {broker.subsidiaries.length} related site{broker.subsidiaries.length > 1 ? 's' : ''}
					{/if}
				</p>
			{/if}

			{#if broker.relistsAfterDays}
				<p class="mb-3 text-xs text-warning">
					Data may reappear after ~{broker.relistsAfterDays} days. Consider re-checking periodically.
				</p>
			{/if}

			<!-- Search link -->
			{#if broker.searchUrl}
				<a
					href={broker.searchUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
				>
					Search for your profile on {broker.name}
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
					</svg>
				</a>
			{/if}

			<!-- Email section -->
			{#if hasEmail && broker.emailAddress}
				<div class="mb-4">
					<h4 class="mb-2 text-sm font-semibold text-text">Email removal request</h4>
					{#if hasUserInfo}
						<EmailPreview {broker} {userInfo} />
					{:else}
						<p class="text-sm text-text-muted">Fill in your information above to generate a pre-filled email.</p>
					{/if}
				</div>
			{/if}

			<!-- Form walkthrough -->
			{#if hasForm && broker.steps?.length}
				<div class="mb-4">
					<h4 class="mb-2 text-sm font-semibold text-text">Step-by-step walkthrough</h4>
					<StepWalkthrough steps={broker.steps} />
				</div>
			{/if}

			<!-- Status actions -->
			<div class="flex flex-wrap gap-2 border-t border-border pt-3">
				{#if hasEmail && status !== 'email-sent' && status !== 'confirmed'}
					<button
						onclick={() => onStatusChange(broker.id, 'email-sent')}
						class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-alt"
					>
						Mark as email sent
					</button>
				{/if}
				{#if hasForm && status !== 'form-submitted' && status !== 'confirmed'}
					<button
						onclick={() => onStatusChange(broker.id, 'form-submitted')}
						class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-alt"
					>
						Mark as form submitted
					</button>
				{/if}
				{#if status !== 'verification-pending' && status !== 'confirmed' && status !== 'not-started'}
					<button
						onclick={() => onStatusChange(broker.id, 'verification-pending')}
						class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-alt"
					>
						Awaiting verification
					</button>
				{/if}
				{#if status !== 'confirmed'}
					<button
						onclick={() => onStatusChange(broker.id, 'confirmed')}
						class="rounded-lg border border-accent bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
					>
						Confirmed removed
					</button>
				{/if}
				{#if status !== 'skipped' && status !== 'confirmed'}
					<button
						onclick={() => onStatusChange(broker.id, 'skipped')}
						class="rounded-lg px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-surface-alt"
					>
						Skip
					</button>
				{/if}
				{#if status !== 'not-started'}
					<button
						onclick={() => onStatusChange(broker.id, 'not-started')}
						class="rounded-lg px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-surface-alt"
					>
						Reset
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
