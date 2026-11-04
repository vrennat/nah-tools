import { error } from '@sveltejs/kit';

/** Parse a JSON request body, turning malformed input into a 400 instead of a 500. */
export async function readJson(request: Request): Promise<unknown> {
	try {
		return await request.json();
	} catch {
		throw error(400, 'Request body must be valid JSON');
	}
}
