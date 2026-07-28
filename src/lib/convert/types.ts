import type { CodecName } from '$compress/types';

export interface ConversionPair {
	slug: string;
	sourceFormat: string;
	targetFormat: string;
	sourceExtensions: string;
	sourceMimeTypes: string;
	targetCodec: CodecName;
	defaultQuality: number;
	supportsQuality: boolean;
	title: string;
	description: string;
	popular: boolean;
	/**
	 * Optional pair-specific FAQ content, authored per pair to break up the
	 * near-identical templated FAQ text that `faqsForPair` otherwise generates
	 * by substituting `${sourceFormat}`/`${targetFormat}` into fixed prose.
	 * Unset by default — `faqsForPair` falls back to the generic template for
	 * any field left empty, so adding this type is a no-op until content is
	 * written pair by pair.
	 */
	faqOverrides?: {
		/** Replaces the "How do I convert X to Y" answer with a pair-specific
		 *  real-world scenario (e.g. why iPhone photos need HEIC to JPG). */
		useCase?: string;
		/** One additional pair-specific FAQ appended after the templated set. */
		extraQuestion?: { question: string; answer: string };
	};
}

export interface ConversionResult {
	blob: Blob;
	filename: string;
	originalSize: number;
	convertedSize: number;
}
