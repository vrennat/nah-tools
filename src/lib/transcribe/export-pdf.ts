/**
 * Exports a transcript as a PDF document.
 * Uses jspdf (already installed) via dynamic import so it does not affect
 * the initial page bundle size.
 */

import type { TranscriptChunk } from './types';

/** Options controlling how the transcript is laid out in the PDF. */
export interface PdfExportOptions {
	/** When true, include SRT-style timestamps as a prefix on each paragraph */
	includeTimestamps?: boolean;
}

/**
 * Formats seconds as H:MM:SS for the timestamp prefix in the PDF.
 * Shorter than full SRT format since this is for human reading, not subtitle sync.
 */
function pdfTimestamp(seconds: number): string {
	const totalSec = Math.floor(seconds);
	const sec = totalSec % 60;
	const min = Math.floor(totalSec / 60) % 60;
	const hr = Math.floor(totalSec / 3600);
	if (hr > 0) {
		return `${hr}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
	}
	return `${min}:${String(sec).padStart(2, '0')}`;
}

/**
 * Triggers a browser download of the transcript as a PDF file.
 *
 * @param chunks - Whisper output chunks
 * @param sourceFilename - Original audio/video filename (used as the document title)
 * @param opts - Layout options
 */
export async function exportTranscriptAsPdf(
	chunks: TranscriptChunk[],
	sourceFilename: string,
	opts: PdfExportOptions = {}
): Promise<void> {
	const { includeTimestamps = false } = opts;

	// Dynamic import — jspdf is a large library (>300 KB) and only needed when
	// the user explicitly requests a PDF download.
	const { jsPDF } = await import('jspdf');

	const doc = new jsPDF({ unit: 'mm', format: 'a4' });

	const marginLeft = 20;
	const marginRight = 20;
	const marginTop = 20;
	const pageWidth = doc.internal.pageSize.getWidth();
	const usableWidth = pageWidth - marginLeft - marginRight;

	let y = marginTop;

	// Title
	doc.setFontSize(16);
	doc.setFont('helvetica', 'bold');
	const title = sourceFilename.replace(/\.[^.]+$/, '') || 'Transcript';
	const titleLines = doc.splitTextToSize(title, usableWidth) as string[];
	doc.text(titleLines, marginLeft, y);
	y += titleLines.length * 8 + 4;

	// Subtitle
	doc.setFontSize(10);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(100, 100, 100);
	doc.text(`Transcribed with nah.tools — audio never left your device`, marginLeft, y);
	y += 8;

	// Divider
	doc.setDrawColor(200, 200, 200);
	doc.line(marginLeft, y, pageWidth - marginRight, y);
	y += 6;

	// Transcript body
	doc.setFontSize(11);
	doc.setTextColor(30, 30, 30);
	doc.setFont('helvetica', 'normal');

	const lineHeight = 6;
	const pageHeight = doc.internal.pageSize.getHeight();
	const bottomMargin = 20;

	for (const chunk of chunks) {
		const text = chunk.text.trim();
		if (!text) continue;

		let line = text;
		if (includeTimestamps) {
			const ts = pdfTimestamp(chunk.timestamp[0]);
			line = `[${ts}]  ${text}`;
		}

		const lines = doc.splitTextToSize(line, usableWidth) as string[];

		for (const l of lines) {
			if (y + lineHeight > pageHeight - bottomMargin) {
				doc.addPage();
				y = marginTop;
			}
			doc.text(l, marginLeft, y);
			y += lineHeight;
		}

		// Paragraph spacing between chunks
		y += 2;
	}

	// Page numbers
	const totalPages = (doc.internal as unknown as { getNumberOfPages(): number }).getNumberOfPages();
	for (let i = 1; i <= totalPages; i++) {
		doc.setPage(i);
		doc.setFontSize(9);
		doc.setTextColor(150, 150, 150);
		doc.text(`${i} / ${totalPages}`, pageWidth - marginRight, pageHeight - 10, { align: 'right' });
	}

	// Derive a clean filename from the source
	const pdfName = sourceFilename.replace(/\.[^.]+$/, '') + '_transcript.pdf';
	doc.save(pdfName);
}
