import { error } from '@sveltejs/kit';
import { allPairs, getPair } from '$convert/pairs';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => allPairs.map((p) => ({ pair: p.slug }));

export const load: PageLoad = ({ params }) => {
	const pair = getPair(params.pair ?? '');
	if (!pair) {
		error(404, 'Conversion not found');
	}
	return { pair };
};
