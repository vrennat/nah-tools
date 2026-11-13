/**
 * The PDF tools must not log values read from the user's file (issue #60).
 * @cantoo/pdf-lib 2.6.5 console.warns parsed numbers and object refs; those
 * calls are removed by patches/@cantoo%2Fpdf-lib@2.6.5.patch.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PDFDocument } from '@cantoo/pdf-lib';
import { registerPDFTools } from './pdf';

const MARKER = '98765432109876543210';

/** A one-page PDF whose page dictionary carries a number too large for a safe integer. */
async function pdfWithHugeNumber(): Promise<string> {
	const doc = await PDFDocument.create();
	doc.addPage([200, 200]);
	const bytes = await doc.save({ useObjectStreams: false });
	const text = new TextDecoder('latin1').decode(bytes);
	// Add the key to the page (not /Pages); the xref offsets after it shift, which pdf-lib tolerates.
	const patched = text.replace(/\/Type \/Page(?!s)/, `/Type /Page /NahTest ${MARKER}`);
	if (patched === text) throw new Error('page dictionary not found');
	return Buffer.from(patched, 'latin1').toString('base64');
}

function captureTools() {
	const tools = new Map<string, (args: Record<string, unknown>) => Promise<{ content: { text: string }[]; isError?: boolean }>>();
	registerPDFTools({ registerTool: (name: string, _meta: unknown, handler: never) => tools.set(name, handler) } as never);
	return tools;
}

afterEach(() => vi.restoreAllMocks());

describe('PDF tool logging', () => {
	it('logs nothing from the file when parsing a PDF with an oversized number', async () => {
		const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) =>
			vi.spyOn(console, m).mockImplementation(() => {})
		);
		const tool = captureTools().get('pdf_get_info')!;
		const res = await tool({ pdf_base64: await pdfWithHugeNumber() });
		expect(res.isError, res.content[0]?.text).toBeFalsy();
		const logged = spies.flatMap((s) => s.mock.calls.map((c) => c.map(String).join(' ')));
		expect(logged.filter((l) => l.includes(MARKER) || l.includes('Parsed number'))).toEqual([]);
	});
});
