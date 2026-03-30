export const ssr = false;

export function load({ params }: { params: { handle: string } }) {
	return { handle: params.handle };
}
