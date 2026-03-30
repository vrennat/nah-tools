export interface BioProfile {
	id: number;
	handle: string;
	display_name: string;
	bio: string | null;
	avatar_url: string | null;
	theme: string;
	passphrase_hash: string;
	is_active: number;
	view_count: number;
	created_at: string;
	updated_at: string;
}

export interface BioLink {
	id: number;
	profile_handle: string;
	url: string;
	title: string;
	icon: string | null;
	order_index: number;
	is_active: number;
	click_count: number;
	created_at: string;
	updated_at: string;
}

export interface BioClickLog {
	id: number;
	profile_handle: string;
	link_id: number;
	clicked_at: string;
	country: string | null;
	device_type: string | null;
	referer: string | null;
}

export interface BioClickStats {
	totalViews: number;
	totalClicks: number;
	clicksByLink: { link_id: number; title: string; url: string; count: number }[];
	clicksByDay: { date: string; count: number }[];
	topCountries: { country: string; count: number }[];
	topReferers: { referer: string; count: number }[];
}

export interface BioTheme {
	id: string;
	name: string;
	bg: string;
	text: string;
	bio: string;
	linkBg: string;
	linkText: string;
	linkHover: string;
	linkBorder: string;
	linkRadius: string;
	fontFamily: string;
}
