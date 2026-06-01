<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import { validateCron, describeCron, nextRuns } from '$lib/dev/cron';

	let minute = $state('0');
	let hour = $state('9');
	let dom = $state('*');
	let month = $state('*');
	let dow = $state('1-5');

	const expr = $derived(`${minute} ${hour} ${dom} ${month} ${dow}`);

	const validation = $derived(validateCron(expr));
	const description = $derived(validation.valid ? describeCron(expr) : '');
	const runs = $derived.by(() => {
		if (!validation.valid) return [] as Date[];
		try {
			return nextRuns(expr, new Date(), 5);
		} catch {
			return [] as Date[];
		}
	});

	const presets: { label: string; fields: [string, string, string, string, string] }[] = [
		{ label: 'Every minute', fields: ['*', '*', '*', '*', '*'] },
		{ label: 'Every 15 min', fields: ['*/15', '*', '*', '*', '*'] },
		{ label: 'Hourly', fields: ['0', '*', '*', '*', '*'] },
		{ label: 'Daily 9am', fields: ['0', '9', '*', '*', '*'] },
		{ label: 'Weekdays 9am', fields: ['0', '9', '*', '*', '1-5'] },
		{ label: 'Monthly 1st', fields: ['0', '0', '1', '*', '*'] }
	];

	function applyPreset(fields: [string, string, string, string, string]) {
		[minute, hour, dom, month, dow] = fields;
	}

	const faqs = [
		{
			question: 'Is my cron expression sent to a server?',
			answer:
				'No. All parsing, validation, and next-run calculation happens entirely in your browser. Nothing is sent to a server — not even a single character of your expression.'
		},
		{
			question: 'What syntax does this support?',
			answer:
				'Standard five-field cron: minute, hour, day-of-month, month, and day-of-week. Supports wildcards (*), step values (*/n), ranges (a-b), range steps (a-b/n), comma lists, and common name aliases for months (jan–dec) and weekdays (sun–sat).'
		},
		{
			question: 'Why do day-of-month and day-of-week interact oddly?',
			answer:
				'Standard cron OR semantics: when both fields are restricted (neither is *), a run is scheduled if either matches. This matches the behavior of most Unix cron implementations.'
		}
	];
</script>

<DevToolShell
	slug="cron"
	title="Cron Expression Builder"
	tagline="Build, validate, and preview cron schedules — with next-run times and plain-English explanations."
	description="Free cron expression builder and validator. Enter or build a cron schedule, see a plain-English description, and preview the next 5 run times. 100% client-side."
	{faqs}
>
	<div class="space-y-6">
		<!-- Expression display -->
		<div class="flex items-center gap-3 rounded-xl border border-border bg-surface-alt p-4">
			<span class="flex-1 font-mono text-lg font-medium tracking-widest text-text">{expr}</span>
			<CopyButton text={() => expr} small />
		</div>

		<!-- Preset buttons -->
		<div class="space-y-2">
			<p class="text-sm font-medium text-text-muted">Presets</p>
			<div class="flex flex-wrap gap-2">
				{#each presets as preset}
					<button
						type="button"
						onclick={() => applyPreset(preset.fields)}
						class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
					>
						{preset.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Field inputs -->
		<div class="grid gap-4 sm:grid-cols-5">
			{#each [
				{ id: 'cron-minute', label: 'Minute', hint: '0–59', get: () => minute, set: (v: string) => (minute = v) },
				{ id: 'cron-hour', label: 'Hour', hint: '0–23', get: () => hour, set: (v: string) => (hour = v) },
				{ id: 'cron-dom', label: 'Day of month', hint: '1–31', get: () => dom, set: (v: string) => (dom = v) },
				{ id: 'cron-month', label: 'Month', hint: '1–12 or jan–dec', get: () => month, set: (v: string) => (month = v) },
				{ id: 'cron-dow', label: 'Day of week', hint: '0–6 or sun–sat', get: () => dow, set: (v: string) => (dow = v) }
			] as field}
				<div class="space-y-1.5">
					<label for={field.id} class="block text-sm font-medium text-text">{field.label}</label>
					<input
						id={field.id}
						type="text"
						value={field.get()}
						oninput={(e) => field.set((e.target as HTMLInputElement).value)}
						spellcheck="false"
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
					<p class="text-xs text-text-muted">{field.hint}</p>
				</div>
			{/each}
		</div>

		<!-- Validation + description -->
		{#if !validation.valid}
			<div class="rounded-xl border border-border bg-surface-alt p-4">
				<p class="text-sm text-error">{validation.error}</p>
			</div>
		{:else}
			<div class="rounded-xl border border-border bg-surface-alt p-4">
				<p class="text-sm text-text">{description}</p>
			</div>
		{/if}

		<!-- Next runs -->
		{#if validation.valid && runs.length > 0}
			<div class="space-y-2">
				<p class="text-sm font-medium text-text">Next 5 scheduled runs</p>
				<ol class="space-y-1">
					{#each runs as run, i}
						<li class="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
							<span class="w-4 text-right font-mono text-xs text-text-muted">{i + 1}</span>
							<span class="font-mono text-sm text-text">{run.toLocaleString()}</span>
						</li>
					{/each}
				</ol>
			</div>
		{/if}
	</div>
</DevToolShell>
