<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';

	const EXAMPLES = [
		{ label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}' },
		{ label: 'URL', pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*' },
		{ label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
		{ label: 'Hex color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b' },
		{ label: 'ISO date', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])' }
	];

	let pattern = $state('');
	let flagG = $state(true);
	let flagI = $state(false);
	let flagM = $state(false);
	let flagS = $state(false);
	let flagU = $state(false);
	let flagY = $state(false);
	let testString = $state('');
	let replacement = $state('');

	const flagStr = $derived(
		(flagG ? 'g' : '') +
		(flagI ? 'i' : '') +
		(flagM ? 'm' : '') +
		(flagS ? 's' : '') +
		(flagU ? 'u' : '') +
		(flagY ? 'y' : '')
	);

	type RegexResult = { ok: true; regex: RegExp } | { ok: false; error: string };

	const compiled = $derived.by((): RegexResult => {
		if (!pattern) return { ok: true, regex: /(?:)/ };
		try {
			return { ok: true, regex: new RegExp(pattern, flagStr) };
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Invalid pattern' };
		}
	});

	function escapeHtml(s: string): string {
		return s
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	interface MatchInfo {
		index: number;
		fullMatch: string;
		groups: string[];
		namedGroups: Record<string, string> | null;
	}

	const matches = $derived.by((): MatchInfo[] => {
		if (!compiled.ok || !pattern || !testString) return [];
		const re = compiled.regex;
		const results: MatchInfo[] = [];
		const scanFlags = re.flags.includes('g') ? re.flags : re.flags + 'g';
		const scan = new RegExp(re.source, scanFlags);
		let m: RegExpExecArray | null;

		while ((m = scan.exec(testString)) !== null) {
			results.push({
				index: m.index,
				fullMatch: m[0],
				groups: m.slice(1).map((g) => (g === undefined ? '(undefined)' : g)),
				namedGroups: m.groups ? { ...m.groups } : null
			});
			if (m[0].length === 0) scan.lastIndex = m.index + 1;
		}

		return results;
	});

	const highlightedHtml = $derived.by((): string => {
		if (!compiled.ok || !pattern || !testString) return escapeHtml(testString);
		const ranges: [number, number][] = matches.map((m) => [m.index, m.index + m.fullMatch.length]);
		let result = '';
		let cursor = 0;
		for (const [start, end] of ranges) {
			if (start > cursor) result += escapeHtml(testString.slice(cursor, start));
			result += `<mark class="rounded bg-accent/20 text-text">${escapeHtml(testString.slice(start, end))}</mark>`;
			cursor = end;
		}
		if (cursor < testString.length) result += escapeHtml(testString.slice(cursor));
		return result;
	});

	const replaceOutput = $derived.by((): string => {
		if (!compiled.ok || !pattern || !testString) return '';
		try {
			return testString.replace(compiled.regex, replacement);
		} catch {
			return '';
		}
	});

	const faqs = [
		{
			question: 'Is my test data sent anywhere?',
			answer: 'No. All matching runs entirely in your browser using the native JavaScript RegExp engine. Nothing leaves your device.'
		},
		{
			question: 'Which flags are supported?',
			answer: 'g (global), i (case-insensitive), m (multiline), s (dotAll — dot matches newline), u (unicode), and y (sticky). Combine them freely; the tool rebuilds the RegExp on every keystroke.'
		},
		{
			question: 'How do named capture groups work?',
			answer: 'Use (?<name>...) syntax. Named groups appear in the match list alongside numbered captures. In the replacement input you can reference them as ${name}.'
		}
	];
</script>

<DevToolShell
	slug="regex"
	title="Regex Tester"
	tagline="Test regular expressions with live match highlighting, capture groups, and replace — all in your browser."
	description="Free online regex tester with live highlighting, capture group inspection, and replace. Supports all JS flags. 100% client-side, nothing uploaded."
	{faqs}
>
	<div class="space-y-6">
		<!-- Pattern + flags -->
		<div class="space-y-3">
			<div class="flex flex-wrap items-end gap-3">
				<div class="min-w-0 flex-1">
					<label for="regex-pattern" class="mb-1 block text-sm font-medium text-text">Pattern</label>
					<div class="flex items-center rounded-lg border border-border bg-surface focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
						<span class="select-none px-3 font-mono text-text-muted">/</span>
						<input
							id="regex-pattern"
							bind:value={pattern}
							spellcheck="false"
							placeholder="[a-z]+"
							class="min-w-0 flex-1 bg-transparent py-2 font-mono text-sm focus:outline-none"
						/>
						<span class="select-none px-3 font-mono text-text-muted">/{flagStr}</span>
					</div>
				</div>
				<div class="flex flex-wrap items-center gap-2 pb-0.5">
					{#each [
						{ label: 'g', value: flagG, set: (v: boolean) => { flagG = v; } },
						{ label: 'i', value: flagI, set: (v: boolean) => { flagI = v; } },
						{ label: 'm', value: flagM, set: (v: boolean) => { flagM = v; } },
						{ label: 's', value: flagS, set: (v: boolean) => { flagS = v; } },
						{ label: 'u', value: flagU, set: (v: boolean) => { flagU = v; } },
						{ label: 'y', value: flagY, set: (v: boolean) => { flagY = v; } }
					] as flag}
						<label class="flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-sm font-mono font-medium text-text transition-colors hover:border-accent/50 has-[:checked]:border-accent has-[:checked]:text-accent">
							<input
								type="checkbox"
								checked={flag.value}
								onchange={(e) => flag.set((e.target as HTMLInputElement).checked)}
								class="sr-only"
							/>
							{flag.label}
						</label>
					{/each}
				</div>
			</div>

			{#if !compiled.ok}
				<p class="text-sm text-error">{compiled.error}</p>
			{/if}

			<div class="flex flex-wrap items-center gap-2">
				<span class="text-xs text-text-muted">Examples:</span>
				{#each EXAMPLES as ex}
					<button
						type="button"
						onclick={() => (pattern = ex.pattern)}
						class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
					>{ex.label}</button>
				{/each}
			</div>
		</div>

		<!-- Test string -->
		<div class="space-y-2">
			<label for="regex-test" class="block text-sm font-medium text-text">Test string</label>
			<textarea
				id="regex-test"
				bind:value={testString}
				spellcheck="false"
				placeholder="Paste text to test against..."
				class="h-32 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>
		</div>

		{#if testString}
			<!-- Highlighted preview -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-text">Preview</span>
					{#if compiled.ok && pattern}
						<span class="text-xs text-text-muted">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
					{/if}
				</div>
				<div class="min-h-12 rounded-lg border border-border bg-surface-alt px-3 py-2 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
					{@html highlightedHtml}
				</div>
			</div>

			<!-- Match list -->
			{#if compiled.ok && pattern}
				<div class="space-y-2">
					<span class="text-sm font-medium text-text">Matches</span>
					{#if matches.length === 0}
						<p class="text-sm text-text-muted">No matches.</p>
					{:else}
						<div class="space-y-2">
							{#each matches as m, i}
								<div class="rounded-lg border border-border bg-surface p-3 text-sm">
									<span class="text-xs text-text-muted">Match {i + 1} at index {m.index}</span>
									<p class="mt-1 break-all font-mono text-text">{m.fullMatch}</p>
									{#if m.groups.length > 0}
										<div class="mt-2 space-y-1">
											{#each m.groups as g, gi}
												<p class="text-xs text-text-muted">
													<span class="font-mono text-accent">${gi + 1}</span>: <span class="font-mono">{g}</span>
												</p>
											{/each}
										</div>
									{/if}
									{#if m.namedGroups && Object.keys(m.namedGroups).length > 0}
										<div class="mt-2 space-y-1">
											{#each Object.entries(m.namedGroups) as [name, val]}
												<p class="text-xs text-text-muted">
													<span class="font-mono text-accent">${'{' + name + '}'}</span>: <span class="font-mono">{val}</span>
												</p>
											{/each}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/if}

		<!-- Replace -->
		<div class="space-y-3 rounded-xl border border-border bg-surface-alt p-4">
			<span class="text-sm font-medium text-text">Replace</span>
			<div class="space-y-1">
				<label for="regex-replace" class="text-xs text-text-muted">
					Replacement — supports <span class="font-mono">$1</span>, <span class="font-mono">$&amp;</span>, <span class="font-mono">${'{name}'}</span>
				</label>
				<input
					id="regex-replace"
					bind:value={replacement}
					spellcheck="false"
					placeholder="$1"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>
			{#if testString && compiled.ok && pattern}
				<div class="space-y-1">
					<div class="flex items-center justify-between">
						<span class="text-xs text-text-muted">Output</span>
						<CopyButton text={() => replaceOutput} small />
					</div>
					<div class="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm whitespace-pre-wrap break-words">{replaceOutput}</div>
				</div>
			{/if}
		</div>
	</div>
</DevToolShell>
