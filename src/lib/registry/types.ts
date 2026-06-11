export type FamilyId =
	| 'pdf'
	| 'pptx'
	| 'photo'
	| 'convert'
	| 'media'
	| 'audio'
	| 'dev'
	| 'text'
	| 'qr'
	| 'legal-gen'
	| 'standalone';

export interface ToolFamily {
	id: FamilyId;
	name: string;
	/** Full hub route path, or null for standalone tools that have no hub. */
	hub: string | null;
	description: string;
}

export interface ToolEntry {
	/** Full route path, e.g. '/pdf/merge'. */
	path: string;
	family: FamilyId;
	name: string;
	description: string;
	/** Inline SVG path(s) for a 24x24 stroke icon. */
	icon?: string;
	keywords?: string[];
	/** Full paths of 3-4 related tools. Falls back to same-family siblings when unset. */
	related?: string[];
	popular?: boolean;
	sitemap?: {
		changefreq?: string;
		priority?: number;
	};
}
