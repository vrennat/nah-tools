/**
 * Error logging for MCP tools. Tool inputs are user files (PDF, PPTX), and
 * exception messages from the parsers can quote their contents or metadata,
 * so only a fixed event, the tool name and the error's class name are logged.
 * The caller still returns the message to the agent that sent the file.
 */

/** Error class names that can appear in the log; anything else is logged as "other". */
const KNOWN_ERRORS = new Set([
	'Error',
	'TypeError',
	'RangeError',
	'SyntaxError',
	'ReferenceError',
	'EvalError',
	'URIError',
	'AggregateError',
	'DOMException',
	'AbortError',
	'TimeoutError',
	'EncryptedPDFError',
	'InvalidPDFDateStringError',
	'MissingPDFHeaderError',
	'MissingPageContentsEmbeddingError',
	'NumberParsingError',
	'PDFParsingError',
	'StalledParserError',
	'UnbalancedParenthesisError',
	'UnexpectedObjectTypeError'
]);

export function errorKind(e: unknown): string {
	const name = e instanceof Error ? e.constructor?.name || e.name : typeof e;
	return KNOWN_ERRORS.has(name) ? name : 'other';
}

export function logToolError(tool: string, e: unknown): void {
	console.error(JSON.stringify({ event: 'mcp_tool_error', tool, error: errorKind(e) }));
}
