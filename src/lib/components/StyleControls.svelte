<script lang="ts">
	import type {
		QRStyleOptions,
		DotStyle,
		CornerSquareStyle,
		CornerDotStyle,
		ErrorCorrectionLevel,
		GradientType
	} from '$qr/types';

	let { options = $bindable() }: { options: QRStyleOptions } = $props();

	let gradientEnabled = $state(!!options.gradient);
	let gradientType = $state<GradientType>(options.gradient?.type ?? 'linear');
	let gradientRotation = $state(options.gradient?.rotation ?? 0);
	let gradientStop1 = $state(options.gradient?.colorStops[0] ?? '#000000');
	let gradientStop2 = $state(options.gradient?.colorStops[1] ?? '#0066ff');

	const dotStyles: { value: DotStyle; label: string }[] = [
		{ value: 'square', label: 'Square' },
		{ value: 'rounded', label: 'Rounded' },
		{ value: 'dots', label: 'Dots' },
		{ value: 'classy', label: 'Classy' },
		{ value: 'classy-rounded', label: 'Classy Rounded' },
		{ value: 'extra-rounded', label: 'Extra Rounded' }
	];

	const cornerSquareStyles: { value: CornerSquareStyle; label: string }[] = [
		{ value: 'square', label: 'Square' },
		{ value: 'extra-rounded', label: 'Extra Rounded' },
		{ value: 'dot', label: 'Dot' }
	];

	const cornerDotStyles: { value: CornerDotStyle; label: string }[] = [
		{ value: 'square', label: 'Square' },
		{ value: 'dot', label: 'Dot' }
	];

	const errorLevels: { value: ErrorCorrectionLevel; label: string }[] = [
		{ value: 'L', label: 'L (Low)' },
		{ value: 'M', label: 'M (Medium)' },
		{ value: 'Q', label: 'Q (Quartile)' },
		{ value: 'H', label: 'H (High)' }
	];

	$effect(() => {
		if (gradientEnabled) {
			options.gradient = {
				type: gradientType,
				rotation: gradientRotation,
				colorStops: [gradientStop1, gradientStop2]
			};
		} else {
			options.gradient = undefined;
		}
	});

	function handleLogoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			options.logo = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		options.logo = undefined;
	}

	const inputClass =
		'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';
	const labelClass = 'block text-sm font-medium text-text mb-1';
</script>

<div class="space-y-6">
	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="qr-fg" class={labelClass}>Foreground</label>
			<div class="flex gap-2">
				<input
					type="color"
					bind:value={options.foreground}
					class="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-0.5"
				/>
				<input id="qr-fg" type="text" bind:value={options.foreground} class={inputClass} />
			</div>
		</div>
		<div>
			<label for="qr-bg" class={labelClass}>Background</label>
			<div class="flex gap-2">
				<input
					type="color"
					bind:value={options.background}
					class="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-0.5"
				/>
				<input id="qr-bg" type="text" bind:value={options.background} class={inputClass} />
			</div>
		</div>
	</div>

	<div>
		<label class="flex items-center gap-2 text-sm font-medium text-text">
			<input type="checkbox" bind:checked={gradientEnabled} class="accent-accent" />
			Gradient foreground
		</label>
		{#if gradientEnabled}
			<div class="mt-3 space-y-3 rounded-lg border border-border bg-surface-alt p-3">
				<div>
					<label for="qr-grad-type" class={labelClass}>Type</label>
					<select id="qr-grad-type" bind:value={gradientType} class={inputClass}>
						<option value="linear">Linear</option>
						<option value="radial">Radial</option>
					</select>
				</div>
				{#if gradientType === 'linear'}
					<div>
						<label for="qr-grad-rotation" class={labelClass}>Rotation ({gradientRotation}deg)</label>
						<input
							id="qr-grad-rotation"
							type="range"
							min="0"
							max="360"
							bind:value={gradientRotation}
							class="w-full accent-accent"
						/>
					</div>
				{/if}
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="qr-grad-start" class={labelClass}>Start color</label>
						<div class="flex gap-2">
							<input
								type="color"
								bind:value={gradientStop1}
								class="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-0.5"
							/>
							<input id="qr-grad-start" type="text" bind:value={gradientStop1} class={inputClass} />
						</div>
					</div>
					<div>
						<label for="qr-grad-end" class={labelClass}>End color</label>
						<div class="flex gap-2">
							<input
								type="color"
								bind:value={gradientStop2}
								class="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-0.5"
							/>
							<input id="qr-grad-end" type="text" bind:value={gradientStop2} class={inputClass} />
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="qr-dot-style" class={labelClass}>Dot style</label>
			<select id="qr-dot-style" bind:value={options.dotStyle} class={inputClass}>
				{#each dotStyles as { value, label }}
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="qr-corner-sq" class={labelClass}>Corner square style</label>
			<select id="qr-corner-sq" bind:value={options.cornerSquareStyle} class={inputClass}>
				{#each cornerSquareStyles as { value, label }}
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="qr-corner-dot" class={labelClass}>Corner dot style</label>
			<select id="qr-corner-dot" bind:value={options.cornerDotStyle} class={inputClass}>
				{#each cornerDotStyles as { value, label }}
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="qr-ec" class={labelClass}>Error correction</label>
			<select id="qr-ec" bind:value={options.errorCorrection} class={inputClass}>
				{#each errorLevels as { value, label }}
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div>
		<label for="qr-logo" class={labelClass}>Logo</label>
		{#if options.logo}
			<div class="flex items-center gap-3">
				<img src={options.logo} alt="Logo preview" class="h-12 w-12 rounded-lg border border-border object-contain" />
				<button
					type="button"
					class="rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:bg-surface-alt hover:text-text"
					onclick={removeLogo}
				>
					Remove
				</button>
			</div>
		{:else}
			<input
				id="qr-logo"
				type="file"
				accept="image/*"
				onchange={handleLogoUpload}
				class={inputClass + ' cursor-pointer file:mr-2 file:rounded file:border-0 file:bg-accent file:px-2 file:py-1 file:text-xs file:text-white'}
			/>
		{/if}
	</div>

	{#if options.logo}
		<div>
			<label for="qr-logo-size" class={labelClass}>Logo size ({Math.round((options.logoSize ?? 0.4) * 100)}%)</label>
			<input
				id="qr-logo-size"
				type="range"
				min="0.1"
				max="0.8"
				step="0.05"
				bind:value={options.logoSize}
				class="w-full accent-accent"
			/>
		</div>
	{/if}
</div>
