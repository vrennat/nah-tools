<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import {
		parseHex,
		rgbToHex,
		rgbToHsl,
		hslToRgb,
		rgbToOklch,
		oklchToRgb,
		contrastVerdict,
		fmtRgb,
		fmtHsl,
		fmtOklch,
		type RGB
	} from '$lib/dev/color';

	// ---- main color picker ----

	let rgb = $state<RGB>({ r: 59, g: 130, b: 246 }); // blue-500

	// Local editable text for each format field
	let hexField = $state(rgbToHex({ r: 59, g: 130, b: 246 }));
	let rgbField = $state(fmtRgb({ r: 59, g: 130, b: 246 }));
	let hslField = $state(fmtHsl(rgbToHsl({ r: 59, g: 130, b: 246 })));
	let oklchField = $state(fmtOklch(rgbToOklch({ r: 59, g: 130, b: 246 })));

	// When rgb changes (via color picker or parsed update), sync fields
	$effect(() => {
		hexField = rgbToHex(rgb);
		rgbField = fmtRgb(rgb);
		hslField = fmtHsl(rgbToHsl(rgb));
		oklchField = fmtOklch(rgbToOklch(rgb));
	});

	function setRgb(next: RGB) {
		rgb = next;
	}

	function onNativeColorChange(e: Event) {
		const parsed = parseHex((e.target as HTMLInputElement).value);
		if (parsed) setRgb(parsed);
	}

	function onHexInput(e: Event) {
		hexField = (e.target as HTMLInputElement).value;
		const parsed = parseHex(hexField);
		if (parsed) rgb = parsed;
	}

	function onRgbInput(e: Event) {
		rgbField = (e.target as HTMLInputElement).value;
		const m = rgbField.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
		if (m) {
			const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
			if ([r, g, b].every((n) => n >= 0 && n <= 255)) rgb = { r, g, b };
		}
	}

	function onHslInput(e: Event) {
		hslField = (e.target as HTMLInputElement).value;
		const m = hslField.match(/([\d.]+)[,\s]+([\d.]+)%?[,\s]+([\d.]+)%?/);
		if (m) {
			const h = parseFloat(m[1]), s = parseFloat(m[2]), l = parseFloat(m[3]);
			if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
				rgb = hslToRgb({ h, s, l });
			}
		}
	}

	function onOklchInput(e: Event) {
		oklchField = (e.target as HTMLInputElement).value;
		const m = oklchField.match(/([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/);
		if (m) {
			const l = parseFloat(m[1]) / 100, c = parseFloat(m[2]), h = parseFloat(m[3]);
			if (l >= 0 && l <= 1 && c >= 0 && h >= 0 && h <= 360) {
				rgb = oklchToRgb({ l, c, h });
			}
		}
	}

	// ---- contrast checker ----

	let fgRgb = $state<RGB>({ r: 30, g: 41, b: 59 }); // slate-900
	let bgRgb = $state<RGB>({ r: 249, g: 250, b: 251 }); // gray-50

	let fgHex = $state('#1e293b');
	let bgHex = $state('#f9fafb');

	$effect(() => { fgHex = rgbToHex(fgRgb); });
	$effect(() => { bgHex = rgbToHex(bgRgb); });

	function onFgNative(e: Event) {
		const parsed = parseHex((e.target as HTMLInputElement).value);
		if (parsed) fgRgb = parsed;
	}
	function onBgNative(e: Event) {
		const parsed = parseHex((e.target as HTMLInputElement).value);
		if (parsed) bgRgb = parsed;
	}
	function onFgHexInput(e: Event) {
		fgHex = (e.target as HTMLInputElement).value;
		const parsed = parseHex(fgHex);
		if (parsed) fgRgb = parsed;
	}
	function onBgHexInput(e: Event) {
		bgHex = (e.target as HTMLInputElement).value;
		const parsed = parseHex(bgHex);
		if (parsed) bgRgb = parsed;
	}

	const verdict = $derived(contrastVerdict(fgRgb, bgRgb));

	const faqs = [
		{
			question: 'What are the WCAG contrast thresholds?',
			answer:
				'WCAG 2.1 defines two levels. AA requires a 4.5:1 ratio for normal text (under 18pt / 14pt bold) and 3:1 for large text. AAA requires 7:1 for normal text and 4.5:1 for large text. The higher the ratio, the better readability for users with low vision.'
		},
		{
			question: 'Is my color data sent anywhere?',
			answer:
				'No. All color math runs in your browser — conversions, contrast calculations, everything. Nothing is uploaded or logged.'
		},
		{
			question: 'What is OKLCH and why use it?',
			answer:
				'OKLCH is a perceptually uniform color space. Equal numeric steps in lightness or chroma look equally different to the eye, which makes it ideal for programmatic color manipulation, palette generation, and CSS color-mix().'
		}
	];
</script>

<DevToolShell
	slug="color"
	title="Color Converter & Contrast Checker"
	tagline="Convert between HEX, RGB, HSL, and OKLCH. Check WCAG contrast ratios."
	description="Free in-browser color converter and WCAG contrast checker. HEX, RGB, HSL, OKLCH conversions plus AA/AAA compliance badges. 100% client-side."
	{faqs}
>
	<div class="space-y-10">
		<!-- Color Converter -->
		<section class="space-y-4">
			<h2 class="font-display text-lg font-700 text-text">Color converter</h2>

			<div class="flex flex-col gap-6 sm:flex-row sm:items-start">
				<!-- Swatch + native picker -->
				<div class="flex flex-col items-center gap-3">
					<div
						class="h-24 w-24 rounded-xl border border-border shadow-sm"
						style="background-color: {rgbToHex(rgb)}"
					></div>
					<label for="main-color-picker" class="flex cursor-pointer flex-col items-center gap-1 text-xs text-text-muted">
						<input
							id="main-color-picker"
							type="color"
							value={rgbToHex(rgb)}
							onchange={onNativeColorChange}
							class="h-8 w-16 cursor-pointer rounded border border-border bg-surface"
						/>
						Pick
					</label>
				</div>

				<!-- Format fields -->
				<div class="flex-1 space-y-3">
					{#each [
						{ label: 'HEX', field: hexField, onInput: onHexInput, copyText: () => rgbToHex(rgb) },
						{ label: 'RGB', field: rgbField, onInput: onRgbInput, copyText: () => fmtRgb(rgb) },
						{ label: 'HSL', field: hslField, onInput: onHslInput, copyText: () => fmtHsl(rgbToHsl(rgb)) },
						{ label: 'OKLCH', field: oklchField, onInput: onOklchInput, copyText: () => fmtOklch(rgbToOklch(rgb)) }
					] as row}
						<div class="flex items-center gap-2">
							<span class="w-14 shrink-0 text-xs font-medium text-text-muted">{row.label}</span>
							<input
								type="text"
								value={row.field}
								oninput={row.onInput}
								spellcheck="false"
								class="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
							<CopyButton text={row.copyText} small />
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Contrast Checker -->
		<section class="space-y-4">
			<h2 class="font-display text-lg font-700 text-text">WCAG contrast checker</h2>

			<div class="grid gap-4 sm:grid-cols-2">
				<!-- Foreground -->
				<div class="space-y-2">
					<label for="fg-color-picker" class="text-sm font-medium text-text">Foreground</label>
					<div class="flex items-center gap-2">
						<input
							id="fg-color-picker"
							type="color"
							value={rgbToHex(fgRgb)}
							onchange={onFgNative}
							class="h-9 w-12 cursor-pointer rounded border border-border bg-surface"
						/>
						<input
							type="text"
							value={fgHex}
							oninput={onFgHexInput}
							spellcheck="false"
							class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
					</div>
				</div>

				<!-- Background -->
				<div class="space-y-2">
					<label for="bg-color-picker" class="text-sm font-medium text-text">Background</label>
					<div class="flex items-center gap-2">
						<input
							id="bg-color-picker"
							type="color"
							value={rgbToHex(bgRgb)}
							onchange={onBgNative}
							class="h-9 w-12 cursor-pointer rounded border border-border bg-surface"
						/>
						<input
							type="text"
							value={bgHex}
							oninput={onBgHexInput}
							spellcheck="false"
							class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
					</div>
				</div>
			</div>

			<!-- Ratio + badges -->
			<div class="flex flex-wrap items-center gap-4">
				<span class="font-display text-3xl font-800 text-text">{verdict.ratio}:1</span>

				{#each [
					{ label: 'AA normal', pass: verdict.aaNormal },
					{ label: 'AA large', pass: verdict.aaLarge },
					{ label: 'AAA normal', pass: verdict.aaaNormal },
					{ label: 'AAA large', pass: verdict.aaaLarge }
				] as badge}
					<span
						class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium {badge.pass ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}"
					>
						{#if badge.pass}
							<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						{:else}
							<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						{/if}
						{badge.label}
					</span>
				{/each}
			</div>

			<!-- Live preview -->
			<div
				class="rounded-xl border border-border p-6 space-y-3"
				style="background-color: {rgbToHex(bgRgb)}"
			>
				<p class="text-2xl font-700 leading-tight" style="color: {rgbToHex(fgRgb)}">
					The quick brown fox jumps over the lazy dog.
				</p>
				<p class="text-sm" style="color: {rgbToHex(fgRgb)}">
					Small text — 14px equivalent. Hard to read at low contrast.
				</p>
			</div>
		</section>
	</div>
</DevToolShell>
