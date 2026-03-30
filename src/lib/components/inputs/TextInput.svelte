<script lang="ts">
	import { encodeText } from '$qr/encoder';

	let { value = $bindable('') } = $props();

	let text = $state('');

	$effect(() => {
		value = encodeText(text);
	});
</script>

<div class="space-y-4">
	<div>
		<label for="text" class="mb-1 block text-sm font-medium text-text">Text</label>
		<textarea
			id="text"
			bind:value={text}
			placeholder="Enter any text..."
			rows="4"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		></textarea>
	</div>
</div>
