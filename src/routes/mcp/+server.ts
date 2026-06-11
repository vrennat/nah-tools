import type { RequestHandler } from './$types';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer } from '$lib/server/mcp';
import { checkRateLimit } from '$server/safety';

// Ensure the Accept header includes both types the SDK requires.
// Some MCP clients (Claude Connectors) may not send the full header.
function ensureAcceptHeader(request: Request): Request {
	const accept = request.headers.get('Accept') ?? '';
	if (accept.includes('application/json') && accept.includes('text/event-stream')) {
		return request;
	}
	const headers = new Headers(request.headers);
	headers.set('Accept', 'application/json, text/event-stream');
	return new Request(request.url, {
		method: request.method,
		headers,
		body: request.body,
		// @ts-expect-error -- duplex is required for streaming bodies but not in all type defs
		duplex: 'half'
	});
}

// Stateless: create a fresh server + transport per request.
// Cloudflare Workers are stateless, so no session management.
// enableJsonResponse avoids SSE streaming issues on Workers.
async function handleMcpRequest(request: Request, clientIp: string): Promise<Response> {
	// 30 requests/min per IP, namespaced so it doesn't interfere with link-creation limits.
	if (!checkRateLimit(`mcp:${clientIp}`, 1, { windowMs: 60_000, max: 30 })) {
		return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }), {
			status: 429,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const server = createMcpServer();
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
		enableJsonResponse: true
	});

	await server.connect(transport);

	try {
		return await transport.handleRequest(ensureAcceptHeader(request));
	} finally {
		await server.close();
	}
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	return handleMcpRequest(request, getClientAddress());
};

export const GET: RequestHandler = async ({ request, getClientAddress }) => {
	return handleMcpRequest(request, getClientAddress());
};

export const DELETE: RequestHandler = async ({ request, getClientAddress }) => {
	return handleMcpRequest(request, getClientAddress());
};
