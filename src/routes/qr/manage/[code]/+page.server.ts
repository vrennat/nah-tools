import type { ServerLoadEvent } from '@sveltejs/kit';

export const load = async ({ params }: ServerLoadEvent) => ({ code: params.code });
