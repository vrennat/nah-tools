<script lang="ts">
	import { encodeURL } from '$qr/encoder';

	let { value = $bindable('') } = $props();

	let url = $state('');

	$effect(() => {
		value = encodeURL(url);
	});
</script>

<div class="space-y-4">
	<div>
		<label for="url" class="mb-1 block text-sm font-medium text-text">URL</label>
		<input
			id="url"
			type="url"
			bind:value={url}
			placeholder="https://example.com"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>
</div>
