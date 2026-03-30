<script lang="ts">
	import type { Broker, UserInfo } from '$remove/types';
	import { generateEmail } from '$remove/templates';

	let { broker, userInfo }: { broker: Broker; userInfo: UserInfo } = $props();

	let copied = $state(false);

	let email = $derived(generateEmail(broker, userInfo));

	function copyToClipboard() {
		navigator.clipboard.writeText(email.body);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="space-y-3">
	<div class="rounded-lg border border-border bg-surface-alt p-4">
		<div class="mb-2 flex items-center gap-2 text-xs text-text-muted">
			<span class="font-medium">To:</span>
			<span class="font-mono">{email.to}</span>
		</div>
		<div class="mb-3 flex items-center gap-2 text-xs text-text-muted">
			<span class="font-medium">Subject:</span>
			<span>{email.subject}</span>
		</div>
		<pre class="whitespace-pre-wrap text-sm text-text">{email.body}</pre>
	</div>

	<div class="flex gap-2">
		<a
			href={email.mailto}
			class="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
			</svg>
			Open in email
		</a>
		<button
			onclick={copyToClipboard}
			class="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-alt"
		>
			{#if copied}
				Copied
			{:else}
				Copy to clipboard
			{/if}
		</button>
	</div>
</div>
