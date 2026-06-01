<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';

	// Live clock
	let nowMs = $state(Date.now());

	$effect(() => {
		const id = setInterval(() => {
			nowMs = Date.now();
		}, 1000);
		return () => clearInterval(id);
	});

	const nowSec = $derived(Math.floor(nowMs / 1000));
	const nowIso = $derived(new Date(nowMs).toISOString());

	// From timestamp
	let tsInput = $state('');

	const tsDate = $derived.by((): Date | null => {
		const raw = tsInput.trim();
		if (!raw) return null;
		const n = Number(raw);
		if (!isFinite(n)) return null;
		// abs >= 1e12 → milliseconds, else seconds
		const ms = Math.abs(n) >= 1e12 ? n : n * 1000;
		return new Date(ms);
	});

	function relativeTime(diffMs: number): string {
		const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
		const abs = Math.abs(diffMs);
		if (abs < 60_000) return rtf.format(Math.round(diffMs / 1000), 'second');
		if (abs < 3_600_000) return rtf.format(Math.round(diffMs / 60_000), 'minute');
		if (abs < 86_400_000) return rtf.format(Math.round(diffMs / 3_600_000), 'hour');
		if (abs < 2_592_000_000) return rtf.format(Math.round(diffMs / 86_400_000), 'day');
		if (abs < 31_536_000_000) return rtf.format(Math.round(diffMs / 2_592_000_000), 'month');
		return rtf.format(Math.round(diffMs / 31_536_000_000), 'year');
	}

	const tsOutputs = $derived.by(() => {
		const d = tsDate;
		if (!d || isNaN(d.getTime())) return null;
		return {
			isoUtc: d.toISOString(),
			local: d.toLocaleString(),
			utcString: d.toUTCString(),
			relative: relativeTime(d.getTime() - nowMs)
		};
	});

	// From date string
	let dateInput = $state('');

	type DateResult = { ok: true; date: Date } | { ok: false; error: string };

	const dateResult = $derived.by((): DateResult => {
		const raw = dateInput.trim();
		if (!raw) return { ok: false, error: '' };
		const d = new Date(raw);
		if (isNaN(d.getTime())) return { ok: false, error: 'Invalid date — try ISO 8601, e.g. 2024-06-15T12:00:00' };
		return { ok: true, date: d };
	});

	// Timezone viewer
	const tzList: string[] = (() => {
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Intl.supportedValuesOf may not exist in all TS lib targets
			return (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('timeZone');
		} catch {
			return [
				'UTC',
				'America/New_York',
				'America/Chicago',
				'America/Denver',
				'America/Los_Angeles',
				'Europe/London',
				'Europe/Paris',
				'Europe/Berlin',
				'Asia/Tokyo',
				'Asia/Shanghai',
				'Asia/Kolkata',
				'Australia/Sydney'
			];
		}
	})();

	let selectedTz = $state('UTC');

	// The date to show in the tz viewer: prefer the from-timestamp date, then from-date, else now
	const tzSourceDate = $derived(
		tsDate && !isNaN(tsDate.getTime())
			? tsDate
			: dateResult.ok
				? dateResult.date
				: new Date(nowMs)
	);

	const tzFormatted = $derived.by(() => {
		try {
			return new Intl.DateTimeFormat(undefined, {
				timeZone: selectedTz,
				dateStyle: 'medium',
				timeStyle: 'long'
			} as Intl.DateTimeFormatOptions).format(tzSourceDate);
		} catch {
			return 'Invalid timezone';
		}
	});

	const faqs = [
		{
			question: 'Is any data sent to a server?',
			answer:
				'No. All conversions happen locally in your browser using the JavaScript Date API. Nothing is transmitted anywhere.'
		},
		{
			question: 'How does the tool tell seconds from milliseconds?',
			answer:
				'If the absolute value of the number is 1,000,000,000,000 (10^12) or greater it is treated as milliseconds; otherwise as Unix seconds. This threshold correctly covers all dates from 1970 to the year 33658.'
		},
		{
			question: 'What date string formats does "From date" accept?',
			answer:
				'Any format the browser\'s Date constructor can parse — most reliably ISO 8601 (e.g., 2024-06-15T12:00:00Z, 2024-06-15). Ambiguous locale formats like 06/15/2024 may parse inconsistently across browsers.'
		}
	];
</script>

<DevToolShell
	slug="timestamp"
	title="Unix Timestamp Converter"
	tagline="Convert Unix timestamps to ISO 8601, local time, and relative time — and back again."
	description="Free Unix timestamp converter. Decode seconds or milliseconds to ISO 8601, UTC, local, and relative time. Convert dates back to timestamps. Timezone viewer included. 100% client-side."
	{faqs}
>
	<div class="space-y-6">
		<!-- Live clock -->
		<div class="rounded-xl border border-border bg-surface-alt p-4">
			<h2 class="mb-3 text-sm font-medium text-text">Current time</h2>
			<div class="space-y-2">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div>
						<span class="text-xs text-text-muted">Unix seconds</span>
						<p class="font-mono text-lg font-700 tabular-nums text-text">{nowSec}</p>
					</div>
					<CopyButton text={() => String(nowSec)} small />
				</div>
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div>
						<span class="text-xs text-text-muted">Unix milliseconds</span>
						<p class="font-mono text-lg font-700 tabular-nums text-text">{nowMs}</p>
					</div>
					<CopyButton text={() => String(nowMs)} small />
				</div>
				<p class="font-mono text-sm text-text-muted">{nowIso}</p>
			</div>
		</div>

		<!-- From timestamp -->
		<div class="space-y-3">
			<h2 class="text-sm font-medium text-text">From timestamp</h2>
			<input
				type="number"
				bind:value={tsInput}
				placeholder="1716239022 or 1716239022000"
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
			{#if tsOutputs}
				<div class="divide-y divide-border rounded-lg border border-border bg-surface">
					{#each [
						{ label: 'ISO 8601 UTC', value: tsOutputs.isoUtc },
						{ label: 'Local', value: tsOutputs.local },
						{ label: 'UTC string', value: tsOutputs.utcString },
						{ label: 'Relative', value: tsOutputs.relative }
					] as row}
						<div class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
							<span class="shrink-0 text-text-muted">{row.label}</span>
							<div class="flex min-w-0 items-center gap-2">
								<span class="truncate font-mono text-text">{row.value}</span>
								<CopyButton text={() => row.value} small />
							</div>
						</div>
					{/each}
				</div>
			{:else if tsInput.trim() && !tsDate}
				<p class="text-sm text-error">Not a valid number.</p>
			{/if}
		</div>

		<!-- From date -->
		<div class="space-y-3">
			<h2 class="text-sm font-medium text-text">From date</h2>
			<input
				type="text"
				bind:value={dateInput}
				placeholder="2024-06-15T12:00:00Z"
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
			{#if !dateResult.ok && dateResult.error}
				<p class="text-sm text-error">{dateResult.error}</p>
			{/if}
			{#if dateResult.ok}
				{@const d = dateResult.date}
				<div class="divide-y divide-border rounded-lg border border-border bg-surface">
					{#each [
						{ label: 'Unix seconds', value: String(Math.floor(d.getTime() / 1000)) },
						{ label: 'Unix milliseconds', value: String(d.getTime()) }
					] as row}
						<div class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
							<span class="shrink-0 text-text-muted">{row.label}</span>
							<div class="flex items-center gap-2">
								<span class="font-mono text-text">{row.value}</span>
								<CopyButton text={() => row.value} small />
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Timezone viewer -->
		<div class="space-y-3">
			<h2 class="text-sm font-medium text-text">Timezone viewer</h2>
			<p class="text-xs text-text-muted">
				Shows the currently entered timestamp or date (or now if neither is set) in the selected timezone.
			</p>
			<select
				bind:value={selectedTz}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			>
				{#each tzList as tz}
					<option value={tz}>{tz}</option>
				{/each}
			</select>
			<div class="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
				<span class="font-mono text-text">{tzFormatted}</span>
				<CopyButton text={() => tzFormatted} small />
			</div>
		</div>
	</div>
</DevToolShell>
