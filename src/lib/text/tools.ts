// Registry of text/content tools. Drives the /text hub and the related-tools
// nav on each tool page. Icons are single-path Heroicons-style outlines.

export interface TextTool {
	slug: string;
	name: string;
	/** Short tagline shown in cards and nav. */
	desc: string;
	/** Inline SVG path for a 24x24 stroke icon. */
	icon: string;
	/** Search keywords for SEO/discovery. */
	keywords: string[];
}

export const textTools: TextTool[] = [
	{
		slug: 'word-count',
		name: 'Word Counter',
		desc: 'Words, characters, sentences, reading and speaking time.',
		icon: 'M3 4.5h18M3 9h18M3 13.5h12M3 18h12',
		keywords: ['word count', 'character count', 'reading time', 'speaking time', 'sentences', 'paragraphs']
	},
	{
		slug: 'find-replace',
		name: 'Find & Replace',
		desc: 'Bulk find and replace with regex and case options.',
		icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6',
		keywords: ['find', 'replace', 'regex', 'search', 'substitute', 'bulk', 'case sensitive']
	}
];

export function getTextTool(slug: string): TextTool | undefined {
	return textTools.find((t) => t.slug === slug);
}
