<script lang="ts">
	import { encodePhone } from '$qr/encoder';

	let { value = $bindable('') } = $props();

	let phone = $state('');

	$effect(() => {
		value = encodePhone(phone);
	});
</script>

<div class="space-y-4">
	<div>
		<label for="phone" class="mb-1 block text-sm font-medium text-text">Phone Number</label>
		<input
			id="phone"
			type="tel"
			bind:value={phone}
			placeholder="+1 (555) 123-4567"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>
</div>
