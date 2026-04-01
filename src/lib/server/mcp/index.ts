/**
 * MCP Server — nah.tools
 *
 * Exposes all nah.tools features as MCP tools:
 *   - QR code encoding (all 7 content types)
 *   - PDF processing (merge, split, rotate, watermark, encrypt, and more)
 *   - PPTX processing (merge, split, compress, extract text, watermark, and more)
 *   - Invoice calculations (line items, taxes, discounts)
 *   - Data broker removal (search, email generation, removal plans)
 *
 * All file-based tools accept/return base64-encoded data.
 * The server is stateless — no sessions, no storage, no auth.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerQRTools } from './qr';
import { registerPDFTools } from './pdf';
import { registerPPTXTools } from './pptx';
import { registerInvoiceTools } from './invoice';
import { registerRemovalTools } from './removal';

export function createMcpServer() {
	const server = new McpServer(
		{
			name: 'nah-tools',
			version: '2.0.0'
		},
		{
			capabilities: {
				tools: {},
				prompts: {},
				resources: {}
			}
		}
	);

	registerQRTools(server);
	registerPDFTools(server);
	registerPPTXTools(server);
	registerInvoiceTools(server);
	registerRemovalTools(server);

	return server;
}
