<script lang="ts">
	import { encodeEmail } from '$qr/encoder';

	let { value = $bindable('') } = $props();

	let to = $state('');
	let subject = $state('');
	let body = $state('');

	$effect(() => {
		value = encodeEmail({
			to,
			subject: subject || undefined,
			body: body || undefined
		});
	});
</script>

<div class="space-y-4">
	<div>
		<label for="email-to" class="mb-1 block text-sm font-medium text-text">To</label>
		<input
			id="email-to"
			type="email"
			bind:value={to}
			placeholder="recipient@example.com"
			required
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="email-subject" class="mb-1 block text-sm font-medium text-text">Subject</label>
		<input
			id="email-subject"
			type="text"
			bind:value={subject}
			placeholder="Email subject"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="email-body" class="mb-1 block text-sm font-medium text-text">Body</label>
		<textarea
			id="email-body"
			bind:value={body}
			placeholder="Email body..."
			rows="4"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		></textarea>
	</div>
</div>
