import type { RequestHandler } from './$types';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer } from '$lib/server/mcp';

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
		return await transport.handleRequest(request);
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
