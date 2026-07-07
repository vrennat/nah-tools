export const ssr = false;
export const prerender = false;

export function load({ params }: { params: { handle: string } }) {
	return { handle: params.handle };
}
