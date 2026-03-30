<script lang="ts">
	let {
		onSave
	}: {
		onSave: (dataUrl: string) => void;
	} = $props();

	type TabId = 'draw' | 'type' | 'upload';
	let activeTab = $state<TabId>('draw');

	// Draw state
	let canvas = $state<HTMLCanvasElement>(undefined!);
	let isDrawing = $state(false);
	let hasDrawn = $state(false);

	// Type state
	let typedName = $state('');

	// Upload state
	let uploadedImage = $state('');
	let fileInput = $state<HTMLInputElement>(undefined!);

	function getCanvasCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
		const rect = canvas.getBoundingClientRect();
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		return {
			x: (clientX - rect.left) * scaleX,
			y: (clientY - rect.top) * scaleY
		};
	}

	function startDraw(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		isDrawing = true;
		hasDrawn = true;
		const ctx = canvas.getContext('2d')!;
		const { x, y } = getCanvasCoords(e);
		ctx.beginPath();
		ctx.moveTo(x, y);
	}

	function draw(e: MouseEvent | TouchEvent) {
		if (!isDrawing) return;
		e.preventDefault();
		const ctx = canvas.getContext('2d')!;
		const { x, y } = getCanvasCoords(e);
		ctx.lineWidth = 2.5;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.strokeStyle = '#000000';
		ctx.lineTo(x, y);
		ctx.stroke();
	}

	function stopDraw() {
		isDrawing = false;
	}

	function clearCanvas() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		hasDrawn = false;
	}

	function saveDrawn() {
		if (!canvas || !hasDrawn) return;
		onSave(canvas.toDataURL('image/png'));
	}

	function saveTyped() {
		if (!typedName.trim()) return;
		// Render typed name to a canvas with cursive font
		const tmpCanvas = document.createElement('canvas');
		const ctx = tmpCanvas.getContext('2d')!;
		const fontSize = 48;
		ctx.font = `${fontSize}px "Brush Script MT", "Segoe Script", cursive`;
		const metrics = ctx.measureText(typedName);
		const padding = 16;
		tmpCanvas.width = Math.ceil(metrics.width) + padding * 2;
		tmpCanvas.height = fontSize + padding * 2;
		// Redraw after resize (resize clears canvas)
		ctx.font = `${fontSize}px "Brush Script MT", "Segoe Script", cursive`;
		ctx.fillStyle = '#000000';
		ctx.textBaseline = 'top';
		ctx.fillText(typedName, padding, padding);
		onSave(tmpCanvas.toDataURL('image/png'));
	}

	function handleUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			uploadedImage = reader.result as string;
		};
		reader.readAsDataURL(file);
		target.value = '';
	}

	function saveUploaded() {
		if (!uploadedImage) return;
		onSave(uploadedImage);
	}

	const tabs: { id: TabId; label: string }[] = [
		{ id: 'draw', label: 'Draw' },
		{ id: 'type', label: 'Type' },
		{ id: 'upload', label: 'Upload' }
	];
</script>

<div class="space-y-4">
	<div class="flex gap-1 rounded-lg border border-border bg-surface-alt p-1">
		{#each tabs as tab}
			<button
				type="button"
				class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors {activeTab === tab.id
					? 'bg-accent text-white'
					: 'text-text-muted hover:text-text'}"
				onclick={() => (activeTab = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	{#if activeTab === 'draw'}
		<div class="space-y-3">
			<canvas
				bind:this={canvas}
				width={500}
				height={160}
				class="w-full cursor-crosshair rounded-lg border border-border bg-white"
				style="touch-action: none"
				onmousedown={startDraw}
				onmousemove={draw}
				onmouseup={stopDraw}
				onmouseleave={stopDraw}
				ontouchstart={startDraw}
				ontouchmove={draw}
				ontouchend={stopDraw}
			></canvas>
			<div class="flex gap-2">
				<button
					type="button"
					class="rounded-full border border-border px-4 py-1.5 text-sm text-text-muted transition-colors hover:text-text"
					onclick={clearCanvas}
				>
					Clear
				</button>
				<button
					type="button"
					class="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
					disabled={!hasDrawn}
					onclick={saveDrawn}
				>
					Use Signature
				</button>
			</div>
		</div>
	{:else if activeTab === 'type'}
		<div class="space-y-3">
			<input
				type="text"
				bind:value={typedName}
				placeholder="Type your name"
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
			{#if typedName.trim()}
				<div
					class="flex items-center justify-center rounded-lg border border-border bg-white px-4 py-6"
				>
					<span
						style="font-family: 'Brush Script MT', 'Segoe Script', cursive; font-size: 2.5rem; color: #000"
					>
						{typedName}
					</span>
				</div>
			{/if}
			<button
				type="button"
				class="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
				disabled={!typedName.trim()}
				onclick={saveTyped}
			>
				Use Signature
			</button>
		</div>
	{:else}
		<div class="space-y-3">
			<button
				type="button"
				class="w-full rounded-xl border-2 border-dashed border-border px-6 py-8 text-center transition-colors hover:border-accent/50"
				onclick={() => fileInput.click()}
			>
				{#if uploadedImage}
					<img
						src={uploadedImage}
						alt="Uploaded signature"
						class="mx-auto max-h-24 object-contain"
					/>
				{:else}
					<p class="text-sm font-medium text-text">Click to upload signature image</p>
					<p class="mt-1 text-xs text-text-muted">PNG or JPG</p>
				{/if}
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept=".png,.jpg,.jpeg"
				class="hidden"
				onchange={handleUpload}
			/>
			{#if uploadedImage}
				<div class="flex gap-2">
					<button
						type="button"
						class="rounded-full border border-border px-4 py-1.5 text-sm text-text-muted transition-colors hover:text-text"
						onclick={() => (uploadedImage = '')}
					>
						Remove
					</button>
					<button
						type="button"
						class="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
						onclick={saveUploaded}
					>
						Use Signature
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
