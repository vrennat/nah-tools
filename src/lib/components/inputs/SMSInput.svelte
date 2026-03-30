<script lang="ts">
	import { encodeSMS } from '$qr/encoder';

	let { value = $bindable('') } = $props();

	let phone = $state('');
	let message = $state('');

	$effect(() => {
		value = encodeSMS({
			phone,
			message: message || undefined
		});
	});
</script>

<div class="space-y-4">
	<div>
		<label for="sms-phone" class="mb-1 block text-sm font-medium text-text">Phone Number</label>
		<input
			id="sms-phone"
			type="tel"
			bind:value={phone}
			placeholder="+1 (555) 123-4567"
			required
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="sms-message" class="mb-1 block text-sm font-medium text-text">Message</label>
		<textarea
			id="sms-message"
			bind:value={message}
			placeholder="Optional message..."
			rows="3"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		></textarea>
	</div>
</div>
