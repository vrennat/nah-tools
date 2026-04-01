<script lang="ts">
	import { markdownToHtml } from '$legalgen/renderer';
	import { generateDocument } from '$legalgen/templates';
	import { copyText, downloadMarkdown, downloadHtml, downloadPdf } from '$legalgen/exporter';
	import type { LegalGenInput } from '$legalgen/types';
	import BusinessInfoForm from '$components/legal-gen/BusinessInfoForm.svelte';
	import ThirdPartyForm from '$components/legal-gen/ThirdPartyForm.svelte';
	import DocumentPreview from '$components/legal-gen/DocumentPreview.svelte';

	const today = new Date().toISOString().split('T')[0];

	let input: LegalGenInput = $state({
		business: {
			businessName: '',
			websiteUrl: '',
			contactEmail: '',
			contactAddress: '',
			entityType: 'llc',
			jurisdiction: 'us-general',
			effectiveDate: today
		},
		dataCollection: {
			collectsPersonalInfo: false,
			collectsEmail: false,
			collectsName: false,
			collectsPaymentInfo: false,
			collectsLocation: false,
			collectsCookies: true,
			collectsAnalytics: true,
			collectsDeviceInfo: false,
			collectsUsageData: false,
			collectsChildrenData: false,
			dataRetentionPeriod: '2 years',
			allowsDeletion: false
		},
		thirdParties: {
			usesGoogleAnalytics: true,
			usesStripe: false,
			usesMailchimp: false,
			usesFacebookPixel: false,
			usesCloudflare: true,
			usesAWS: false,
			usesIntercom: false,
			customServices: []
		}
	});

	let isExporting = $state(false);

	const markdown = $derived(generateDocument('cookie-policy', input));
	const html = $derived(markdownToHtml(markdown));

	async function handleCopy() {
		try {
			await copyText(markdown);
			alert('Copied to clipboard');
		} catch (error) {
			alert('Failed to copy: ' + (error instanceof Error ? error.message : 'Unknown error'));
		}
	}

	function handleDownloadMarkdown() {
		downloadMarkdown(markdown, 'cookie-policy');
	}

	function handleDownloadHtml() {
		downloadHtml(markdown, 'cookie-policy');
	}

	async function handleDownloadPdf() {
		isExporting = true;
		try {
			await downloadPdf(markdown, 'cookie-policy');
		} catch (error) {
			alert('Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
		} finally {
			isExporting = false;
		}
	}
</script>

<svelte:head>
	<title>Cookie Policy Generator — nah</title>
	<meta name="description" content="Generate a compliant cookie policy that discloses your tracking practices and third-party services." />
</svelte:head>

<div class="min-h-screen bg-surface">
	<!-- Header -->
	<div class="bg-surface-alt border-b border-border">
		<div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center gap-4 mb-4">
				<a href="/legal-gen" class="text-accent hover:text-accent/80 font-medium text-sm">
					Back
				</a>
			</div>
			<h1 class="text-3xl font-bold text-text font-display">Cookie Policy Generator</h1>
			<p class="text-text-muted mt-2">Disclose your cookie and tracking practices</p>
		</div>
	</div>

	<!-- Export Bar -->
	<div class="sticky top-0 z-10 bg-surface border-b border-border">
		<div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex flex-wrap gap-2">
				<button
					onclick={handleCopy}
					class="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
				>
					Copy Text
				</button>
				<button
					onclick={handleDownloadMarkdown}
					class="px-4 py-2 border border-border text-text rounded-lg font-medium text-sm hover:bg-surface-alt transition-colors"
				>
					Download Markdown
				</button>
				<button
					onclick={handleDownloadHtml}
					class="px-4 py-2 border border-border text-text rounded-lg font-medium text-sm hover:bg-surface-alt transition-colors"
				>
					Download HTML
				</button>
				<button
					onclick={handleDownloadPdf}
					disabled={isExporting}
					class="px-4 py-2 border border-border text-text rounded-lg font-medium text-sm hover:bg-surface-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isExporting ? 'Generating PDF...' : 'Download PDF'}
				</button>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-8">
			<!-- Forms (Left) -->
			<div class="space-y-8">
				<div class="bg-surface border border-border rounded-xl p-6">
					<h2 class="text-lg font-semibold text-text mb-4 font-display">Business Information</h2>
					<BusinessInfoForm bind:business={input.business} />
				</div>

				<div class="bg-surface border border-border rounded-xl p-6">
					<h2 class="text-lg font-semibold text-text mb-4 font-display">Third-Party Services</h2>
					<ThirdPartyForm bind:config={input.thirdParties} />
				</div>
			</div>

			<!-- Preview (Right) -->
			<div class="lg:sticky lg:top-32 lg:h-fit">
				<div class="bg-surface border border-border rounded-xl p-6 max-h-[600px] overflow-hidden flex flex-col">
					<DocumentPreview {html} />
				</div>
			</div>
		</div>
	</div>
</div>
