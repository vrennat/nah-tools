// The /mcp route pairs a landing page with the MCP protocol +server.ts.
// Prerendering the page would let the static asset shadow the protocol
// endpoint on Cloudflare, so it must render at runtime.
export const prerender = false;
