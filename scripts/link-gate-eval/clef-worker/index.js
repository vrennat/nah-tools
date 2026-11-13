// Proxies one Workers AI call for the link-gate eval: POST { model_id, input }
// with Content-Type application/json. Only the Clef model the gate uses is
// allowed, so a stray request cannot spend the account on other models.
const CLEF_MODEL_ID = '@cf/cloudflare/clef';

export default {
	async fetch(req, env) {
		if (req.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405 });
		const type = (req.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
		if (type !== 'application/json') {
			return Response.json({ error: 'Content-Type must be application/json' }, { status: 415 });
		}
		let body;
		try {
			body = await req.json();
		} catch {
			return Response.json({ error: 'body is not JSON' }, { status: 400 });
		}
		const { model_id, input } = body ?? {};
		if (model_id !== CLEF_MODEL_ID) {
			return Response.json({ error: `only ${CLEF_MODEL_ID} is allowed` }, { status: 400 });
		}
		try {
			return Response.json({ r: await env.AI.run(model_id, input) });
		} catch (e) {
			return Response.json({ error: String(e) }, { status: 500 });
		}
	}
};
