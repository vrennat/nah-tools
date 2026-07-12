import type { ConversionPair } from './types';

interface FAQ {
	question: string;
	answer: string;
}

/** Templated per-pair FAQs — feeds ToolShell's FAQPage schema on every pair page. */
export function faqsForPair(pair: ConversionPair): FAQ[] {
	const { sourceFormat: src, targetFormat: tgt } = pair;
	return [
		{
			question: `How do I convert ${src} to ${tgt}?`,
			answer: `Drop your ${src} files on this page, then click Convert. Conversion runs instantly in your browser and each ${tgt} file can be downloaded individually or as a ZIP.`
		},
		{
			question: `Is this ${src} to ${tgt} converter free?`,
			answer:
				'Yes — completely free with no signup, no watermarks, and no file limits. The tool is open source and will stay free.'
		},
		{
			question: `Do my ${src} files get uploaded to a server?`,
			answer: `No. Conversion runs entirely in your browser using WebAssembly. Your ${src} files never leave your device, which also makes it faster than upload-based converters.`
		},
		{
			question: `Will converting ${src} to ${tgt} lose quality?`,
			answer: pair.supportsQuality
				? `${tgt} is a lossy format, so some compression is applied — you control the trade-off with the quality slider (default ${pair.defaultQuality}%). At 85% or above the difference is rarely visible.`
				: `${tgt} is a lossless format, so no image data is discarded during conversion.`
		},
		{
			question: `Can I convert multiple ${src} files at once?`,
			answer: `Yes. Drop as many ${src} files as you like — they convert in batch and you can download the results individually or as a single ZIP.`
		}
	];
}
