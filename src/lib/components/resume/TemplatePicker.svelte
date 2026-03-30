<script lang="ts">
	import type { TemplateId } from '$resume/types';
	import { getTemplateMeta } from '$resume/pdf';

	let { selected = $bindable<TemplateId>('professional') } = $props();

	const templates = getTemplateMeta();
</script>

<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
	{#each templates as tmpl}
		<button
			type="button"
			aria-pressed={selected === tmpl.id}
			class="rounded-xl border-2 p-4 text-left transition-colors {selected === tmpl.id
				? 'border-accent bg-accent/5'
				: 'border-border hover:border-accent/50'}"
			onclick={() => (selected = tmpl.id)}
		>
			<p class="text-sm font-semibold text-text">{tmpl.name}</p>
			<p class="mt-1 text-xs leading-relaxed text-text-muted">{tmpl.description}</p>
		</button>
	{/each}
</div>
