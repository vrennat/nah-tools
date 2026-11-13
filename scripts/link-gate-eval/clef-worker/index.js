// Proxies one Workers AI call for the link-gate eval: POST { model_id, input }.
export default {
	async fetch(req, env) {
		const { model_id, input } = await req.json();
		try {
			return Response.json({ r: await env.AI.run(model_id, input) });
		} catch (e) {
			return Response.json({ error: String(e) }, { status: 500 });
		}
	}
};
