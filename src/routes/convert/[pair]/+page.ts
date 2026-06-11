import { error } from '@sveltejs/kit';
import { getPair } from '$convert/pairs';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = ({ params }) => {
	const pair = getPair(params.pair ?? '');
	if (!pair) {
		error(404, 'Conversion not found');
	}
	return { pair };
};
