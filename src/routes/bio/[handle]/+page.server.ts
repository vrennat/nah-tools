import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDB } from '$server/db';
import { getProfileWithLinks, incrementViewCount } from '$server/bio-db';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDB(platform);
	const result = await getProfileWithLinks(db, params.handle);

	if (!result) {
		throw error(404, 'Profile not found');
	}

	// Increment view count non-blocking
	if (platform?.context?.waitUntil) {
		platform.context.waitUntil(incrementViewCount(db, params.handle));
	}

	return {
		profile: {
			handle: result.profile.handle,
			display_name: result.profile.display_name,
			bio: result.profile.bio,
			avatar_url: result.profile.avatar_url,
			theme: result.profile.theme,
			view_count: result.profile.view_count
		},
		links: result.links.map((l) => ({
			id: l.id,
			url: l.url,
			title: l.title,
			icon: l.icon,
			click_count: l.click_count
		}))
	};
};
