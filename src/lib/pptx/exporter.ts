/**
 * PPTX Export Utilities — download helpers and ZIP packaging.
 */

import { downloadBlob, makeFilename } from '$qr/exporter';

export { downloadBlob, makeFilename };

/** Download a PPTX Uint8Array as a file */
export function downloadPPTX(data: Uint8Array, filename: string) {
	const blob = new Blob([data as BlobPart], {
		type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
	});
	downloadBlob(blob, filename);
}

/** Package multiple files into a ZIP for download */
export async function downloadAsZip(
	files: { name: string; data: Blob | Uint8Array }[],
	zipFilename: string
) {
	const JSZip = (await import('jszip')).default;
	const zip = new JSZip();

	for (const file of files) {
		zip.file(file.name, file.data);
	}

	const blob = await zip.generateAsync({ type: 'blob' });
	downloadBlob(blob, zipFilename);
}
