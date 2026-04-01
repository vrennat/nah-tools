export async function copyHtml(html: string): Promise<void> {
	await navigator.clipboard.writeText(html);
}

export async function copyRichText(html: string): Promise<void> {
	const blob = new Blob([html], { type: 'text/html' });
	const data = [new ClipboardItem({ 'text/html': blob })];
	await navigator.clipboard.write(data);
}

export function downloadHtm(html: string, filename: string = 'email-signature.htm'): void {
	const blob = new Blob([html], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
