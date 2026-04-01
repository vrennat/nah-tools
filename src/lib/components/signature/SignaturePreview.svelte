<script lang="ts">
	import { onMount } from 'svelte';

	let { html = '' }: { html: string } = $props();

	let iframeElement: HTMLIFrameElement | null = $state(null);

	onMount(() => {
		if (iframeElement) {
			const resizeObserver = new ResizeObserver(() => {
				try {
					const contentHeight = iframeElement?.contentDocument?.documentElement.scrollHeight || 300;
					if (iframeElement) {
						iframeElement.style.height = contentHeight + 20 + 'px';
					}
				} catch {
					// Cross-origin iframe access blocked — height stays at default
				}
			});

			resizeObserver.observe(iframeElement);

			return () => resizeObserver.disconnect();
		}
	});

	$effect(() => {
		if (iframeElement && html) {
			try {
				const doc = iframeElement.contentDocument || iframeElement.contentWindow?.document;
				if (doc) {
					doc.open();
					doc.write(`<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body { font-family: Arial, sans-serif; padding: 20px; background: #fff; margin: 0; }
		* { box-sizing: border-box; }
	</style>
</head>
<body>
	${html}
</body>
</html>`);
					doc.close();

					setTimeout(() => {
						const contentHeight = doc.documentElement.scrollHeight || 300;
						if (iframeElement) {
							iframeElement.style.height = contentHeight + 20 + 'px';
						}
					}, 100);
				}
			} catch {
				// Rendering into iframe document failed
			}
		}
	});
</script>

<div class="rounded-xl border border-border bg-surface-alt p-4">
	<p class="mb-3 text-xs font-medium text-text-muted">Preview</p>
	<div class="overflow-auto rounded-lg border border-border bg-white">
		<iframe
			bind:this={iframeElement}
			title="Email signature preview"
			style="border: 0; width: 100%; display: block; min-height: 300px;"
		></iframe>
	</div>
</div>
