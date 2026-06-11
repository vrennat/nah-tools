<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import {
		generatePassword,
		generatePassphrase,
		passwordEntropy,
		passphraseEntropy,
		rateStrength,
		WORDS,
		type PasswordOptions,
		type PassphraseOptions
	} from '$lib/dev/password';

	// ---- tabs ----
	let tab = $state<'random' | 'passphrase'>('random');

	// ---- random password ----
	let length = $state(20);
	let useLower = $state(true);
	let useUpper = $state(true);
	let useNumbers = $state(true);
	let useSymbols = $state(false);
	let excludeAmbiguous = $state(false);
	let password = $state('');

	const pwOpts = $derived<PasswordOptions>({
		length,
		// If all charsets are off, fall back to lowercase so the generator always
		// has a valid pool — without mutating state inside the effect that reads it.
		lowercase: useLower || (!useUpper && !useNumbers && !useSymbols),
		uppercase: useUpper,
		numbers: useNumbers,
		symbols: useSymbols,
		excludeAmbiguous
	});

	function generatePw() {
		password = generatePassword(pwOpts);
	}

	const pwStrength = $derived.by(() => {
		const bits = passwordEntropy(password);
		return rateStrength(bits);
	});

	// ---- passphrase ----
	let wordCount = $state(5);
	let separator = $state('-');
	let capitalize = $state(false);
	let appendNumber = $state(false);
	let passphrase = $state('');

	const ppOpts = $derived<PassphraseOptions>({
		wordCount,
		separator,
		capitalize,
		includeNumber: appendNumber
	});

	function generatePp() {
		passphrase = generatePassphrase(ppOpts);
	}

	const ppStrength = $derived.by(() => {
		const bits = passphraseEntropy(wordCount);
		return rateStrength(bits);
	});

	// Regenerate whenever the relevant options change. These effects call the
	// generators (which read the option state) but never read the output state,
	// so there is no read-write feedback loop. They also run once on init.
	$effect(() => {
		generatePw();
	});

	$effect(() => {
		generatePp();
	});

	function scoreColor(score: number): string {
		if (score <= 1) return 'bg-error';
		if (score === 2) return 'bg-warning';
		return 'bg-success';
	}

	const faqs = [
		{
			question: 'How is entropy calculated?',
			answer:
				'For random passwords, entropy = length × log₂(pool size), where pool size depends on which character sets are active. For passphrases, entropy = word count × log₂(word list size). Higher entropy means more guessing work for an attacker.'
		},
		{
			question: 'Is my password sent anywhere?',
			answer:
				'No. Generation uses the browser\'s crypto.getRandomValues API entirely in your browser. Nothing is transmitted or logged.'
		},
		{
			question: 'How large is the built-in word list for passphrases?',
			answer: `The word list has ${WORDS.length} words, giving roughly ${Math.round(Math.log2(WORDS.length) * 10) / 10} bits of entropy per word. A 5-word passphrase from this list has ~${Math.round(passphraseEntropy(5))} bits — well above the "Strong" threshold.`
		}
	];
</script>

<DevToolShell
	slug="password"
	title="Password & Passphrase Generator"
	tagline="Generate strong passwords and passphrases with entropy-based strength scoring."
	description="Free in-browser password and passphrase generator using crypto.getRandomValues. Configurable length, charsets, word count, and WCAG-style strength meter. 100% client-side."
	{faqs}
>
	<div class="space-y-6">
		<!-- Tab toggle -->
		<div class="inline-flex rounded-lg border border-border p-0.5 text-sm">
			{#each [{ id: 'random', label: 'Random' }, { id: 'passphrase', label: 'Passphrase' }] as t}
				<button
					type="button"
					onclick={() => (tab = t.id as 'random' | 'passphrase')}
					class="rounded-md px-4 py-1.5 font-medium transition-colors {tab === t.id ? 'bg-accent text-white' : 'text-text-muted hover:text-accent'}"
				>
					{t.label}
				</button>
			{/each}
		</div>

		{#if tab === 'random'}
			<!-- Random password -->
			<div class="space-y-5">
				<!-- Controls -->
				<div class="grid gap-4 rounded-xl border border-border bg-surface-alt p-4 sm:grid-cols-2">
					<!-- Length slider -->
					<div class="space-y-1 sm:col-span-2">
						<label for="pw-length" class="flex items-center justify-between text-sm font-medium text-text">
							Length
							<span class="font-mono text-accent">{length}</span>
						</label>
						<input
							id="pw-length"
							type="range"
							min="8"
							max="64"
							bind:value={length}
							class="w-full accent-accent"
						/>
					</div>

					<!-- Charsets -->
					{#each [
						{ label: 'Lowercase (a–z)', bind: () => useLower, set: (v: boolean) => (useLower = v) },
						{ label: 'Uppercase (A–Z)', bind: () => useUpper, set: (v: boolean) => (useUpper = v) },
						{ label: 'Numbers (0–9)', bind: () => useNumbers, set: (v: boolean) => (useNumbers = v) },
						{ label: 'Symbols (!@#…)', bind: () => useSymbols, set: (v: boolean) => (useSymbols = v) },
						{ label: 'Exclude ambiguous (Il1O0o)', bind: () => excludeAmbiguous, set: (v: boolean) => (excludeAmbiguous = v) }
					] as opt}
						<label class="flex cursor-pointer items-center gap-2 text-sm text-text">
							<input
								type="checkbox"
								checked={opt.bind()}
								onchange={(e) => opt.set((e.target as HTMLInputElement).checked)}
								class="h-4 w-4 rounded accent-accent"
							/>
							{opt.label}
						</label>
					{/each}
				</div>

				<!-- Output -->
				<div class="space-y-3">
					<div class="flex items-center gap-2">
						<div class="min-w-0 flex-1 break-all rounded-xl border border-border bg-surface p-4 font-mono text-base leading-relaxed text-text">
							{password || '—'}
						</div>
					</div>
					<div class="flex items-center gap-3">
						<button
							type="button"
							onclick={generatePw}
							class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
						>
							Regenerate
						</button>
						<CopyButton text={() => password} small />
					</div>
				</div>

				<!-- Strength meter -->
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium text-text">{pwStrength.label}</span>
						<span class="font-mono text-text-muted">~{pwStrength.bits} bits</span>
					</div>
					<div class="flex gap-1">
						{#each Array(5) as _, i}
							<div
								class="h-1.5 flex-1 rounded-full transition-colors {i <= pwStrength.score ? scoreColor(pwStrength.score) : 'bg-border'}"
							></div>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<!-- Passphrase -->
			<div class="space-y-5">
				<!-- Controls -->
				<div class="grid gap-4 rounded-xl border border-border bg-surface-alt p-4 sm:grid-cols-2">
					<!-- Word count slider -->
					<div class="space-y-1 sm:col-span-2">
						<label for="pp-wordcount" class="flex items-center justify-between text-sm font-medium text-text">
							Word count
							<span class="font-mono text-accent">{wordCount}</span>
						</label>
						<input
							id="pp-wordcount"
							type="range"
							min="3"
							max="8"
							bind:value={wordCount}
							class="w-full accent-accent"
						/>
					</div>

					<!-- Separator -->
					<div class="space-y-1">
						<label class="text-sm font-medium text-text" for="separator">Separator</label>
						<select
							id="separator"
							bind:value={separator}
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						>
							<option value="-">Hyphen (-)</option>
							<option value="_">Underscore (_)</option>
							<option value=".">Dot (.)</option>
							<option value=" ">Space</option>
						</select>
					</div>

					<!-- Options -->
					<div class="flex flex-col justify-end gap-2">
						<label class="flex cursor-pointer items-center gap-2 text-sm text-text">
							<input
								type="checkbox"
								bind:checked={capitalize}
								class="h-4 w-4 rounded accent-accent"
							/>
							Capitalize words
						</label>
						<label class="flex cursor-pointer items-center gap-2 text-sm text-text">
							<input
								type="checkbox"
								bind:checked={appendNumber}
								class="h-4 w-4 rounded accent-accent"
							/>
							Append number
						</label>
					</div>
				</div>

				<!-- Output -->
				<div class="space-y-3">
					<div class="min-w-0 break-all rounded-xl border border-border bg-surface p-4 font-mono text-base leading-relaxed text-text">
						{passphrase || '—'}
					</div>
					<div class="flex items-center gap-3">
						<button
							type="button"
							onclick={generatePp}
							class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
						>
							Regenerate
						</button>
						<CopyButton text={() => passphrase} small />
					</div>
				</div>

				<!-- Strength meter -->
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium text-text">{ppStrength.label}</span>
						<span class="font-mono text-text-muted">~{ppStrength.bits} bits</span>
					</div>
					<div class="flex gap-1">
						{#each Array(5) as _, i}
							<div
								class="h-1.5 flex-1 rounded-full transition-colors {i <= ppStrength.score ? scoreColor(ppStrength.score) : 'bg-border'}"
							></div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</DevToolShell>
