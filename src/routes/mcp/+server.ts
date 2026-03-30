import type { RequestHandler } from './$types';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer } from '$lib/server/mcp';

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
async function handleMcpRequest(request: Request): Promise<Response> {
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

export const POST: RequestHandler = async ({ request }) => {
	return handleMcpRequest(request);
};

export const GET: RequestHandler = async ({ request }) => {
	return handleMcpRequest(request);
};

export const DELETE: RequestHandler = async ({ request }) => {
	return handleMcpRequest(request);
};
