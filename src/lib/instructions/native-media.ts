import type { NativeMethod, Platform } from './types';

const method = (title: string, steps: string[], caveat: string, source: NativeMethod['source'], kind: NativeMethod['kind'] = 'built-in'): NativeMethod => ({
	kind, title, steps, caveat, source, checked: '2026-10-31'
});
const recordingOnly = (recipe: NativeMethod): NativeMethod => ({ ...recipe, scope: 'recordings-only' });
const finder = { title: 'Apple: Perform quick actions in Finder (macOS 27)', url: 'https://support.apple.com/en-gb/guide/mac-help/mchl97ff9142/27/mac/27' };
const resize = { title: 'Apple: Crop, resize, or rotate an image in Preview', url: 'https://support.apple.com/guide/preview/prvw2015/mac' };
const paint = { title: 'Microsoft: Paint for Windows', url: 'https://www.microsoft.com/en-us/windows/paint' };
const iosImage = { title: 'Apple: Edit an image in Preview on iPhone', url: 'https://support.apple.com/guide/iphone/edit-an-image-iphf1900dea2/ios' };
const previewExport = { title: 'Apple: Convert image file types in Preview (macOS 26)', url: 'https://support.apple.com/en-gb/guide/preview/prvw1012/11.0/mac/26' };
const finderLimit = 'These controls are documented for macOS 27. Available Quick Actions depend on file type and enabled extensions; use More if the action is hidden.';
const paintConvert = (format: string) => method(`Save an image as ${format} with Paint`, [
	'Open the image in Paint and choose File > Save as.',
	`Choose ${format} from the offered file formats, enter a new filename and save. Inspect the saved image.`
], 'Paint documents PNG, JPEG, BMP and GIF formats. Available choices depend on the file; this workflow does not preserve animation. JPEG removes transparency and can lose image detail.', paint);
const finderConvert = (format: string) => method(`Convert HEIC to ${format} in Finder`, [
	'Select the HEIC image in Finder, then right-click and choose Quick Actions > Convert Image (check More if needed).',
	`Choose ${format} if offered, select an image size and create the converted copy. Inspect the result.`
], `${finderLimit} If unavailable, open the image in Preview and use File > Export with an offered format. JPEG is lossy; keep the original.`, finder);
const previewConvert = (format: string) => method(`Export an image as ${format} with Preview`, [
	'Open the image in Preview and choose File > Export.',
	`Choose ${format}, enter a new filename and save. Inspect the converted copy.`
], 'Applies to formats supported by Preview; it does not imply support for every modern image format. JPEG removes transparency and can lose detail; keep the original.', previewExport);

export const mediaNativeInstructions: Record<string, Partial<Record<Platform, NativeMethod>>> = {
	'/photo/rm-bg': {
		mac: method('Remove an image background in Finder', [
			'Select the image in Finder, right-click and choose Quick Actions > Remove Background (check More if needed).',
			'Inspect the generated image, especially fine edges, before using the copy.'
		], `${finderLimit} Automatic selection may miss hair or fine edges.`, finder),
		ios: method('Remove a background with Preview', [
			'Open a copy of the image in Preview and tap More > Remove Background.',
			'Inspect the result and retain a copy with the original background.'
		], 'Requires the Preview app on iOS 26 or later. Controls can vary by version; automatic subject selection may miss fine edges.', iosImage)
	},
	'/photo/compress': {
		mac: method('Reduce image dimensions with Preview', [
			'Open a copy in Preview and choose Tools > Adjust Size.',
			'Enable Resample image, keep proportions and reduce the pixel dimensions; save the copy and inspect its quality and size.'
		], 'Reduces pixel dimensions rather than targeting an exact file size. Smaller dimensions discard detail; keep the full-resolution original.', resize),
		windows: method('Resize an image with Paint', [
			'Open the image in Paint and choose Resize.',
			'Keep proportions and enter smaller pixel dimensions or a smaller percentage, then save under a new filename and inspect the result.'
		], 'Paint on Windows. Reducing dimensions loses detail and does not guarantee a particular file size.', paint),
		ios: method('Reduce image dimensions with Preview', [
			'Open a copy of the image in Preview and tap More > Adjust Size.',
			'Choose smaller size options, tap Done and inspect the saved copy.'
		], 'Requires Preview on iOS 26 or later. Available controls vary by version; resizing loses detail and does not target an exact byte size.', iosImage)
	},
	'/convert/heic-to-jpg': { mac: finderConvert('JPEG') },
	'/convert/heic-to-png': { mac: finderConvert('PNG') },
	'/convert/png-to-jpg': { windows: paintConvert('JPEG') },
	'/convert/jpg-to-png': { windows: paintConvert('PNG') },
	'/convert/bmp-to-png': { windows: paintConvert('PNG'), mac: previewConvert('PNG') },
	'/convert/gif-to-png': { windows: paintConvert('PNG') },
	'/convert/tiff-to-jpg': { mac: previewConvert('JPEG') },
	'/audio/record': {
		windows: method('Record with Windows Sound Recorder', [
			'Find Sound Recorder in Start, open it and allow microphone access if prompted.',
			'Select Record; use Pause and Resume as needed, then Stop.',
			'Find and play back the recording in the saved recordings list.'
		], 'Windows 11 Sound Recorder requires microphone permission. Recordings are limited to three hours; do not assume MP3 output is available.', { title: 'Microsoft: Sound Recorder app for Windows FAQ', url: 'https://support.microsoft.com/en-us/windows/apps/sound-recorder-app-for-windows-faq' })
	},
	'/audio/transcribe': {
		ios: recordingOnly(method('If the recording is already in Voice Memos', [
			'Open a recording in Voice Memos and tap More.',
			'Choose View Transcript or Copy Transcript, then copy and proofread the text.'
		], 'For recordings in Voice Memos, not arbitrary audio-file imports. Requires iPhone 12 or later and a supported language/region. Transcription can contain errors.', { title: 'Apple: View a transcription in Voice Memos on iPhone', url: 'https://support.apple.com/en-lamr/guide/iphone/iph00953a982/ios' })),
		android: recordingOnly(method('If the recording is already in Pixel Recorder', [
			'Open a recording in the Recorder app on a supported Pixel phone.',
			'Open Transcript, review the recognized text and use the sharing controls to share text when available.'
		], 'Pixel Recorder only; device, app version and language support vary. This is not an arbitrary-file import workflow. Re-transcribing can upload audio to Google servers; review the prompt and proofread the output.', { title: 'Google: Find and manage transcripts in Recorder', url: 'https://support.google.com/pixelphone/answer/16267698?hl=en' }, 'app'))
	},
	'/media/trim-audio': {
		mac: method('Trim an audio file in Finder', [
			'Select a supported audio file in Finder, right-click and choose Quick Actions > Trim (check More if needed).',
			'Drag the yellow ends, preview the retained section and select Done; choose to save a new file rather than replace the original.'
		], `${finderLimit} Audio codec support is limited to formats the system can open; this is not a universal audio editor.`, finder),
		ios: recordingOnly(method('If the recording is already in Voice Memos', [
			'Select a recording in Voice Memos, open More and choose the editing/trim control.',
			'Drag the yellow handles to the section to keep and select Trim, then Apply or Done. Save a copy if offered.'
		], 'Voice Memos on iOS 26; for recordings in that app, not a general MP3 or FLAC file editor. Keep a duplicate if you need the complete original recording.', { title: 'Apple: Edit or delete a recording in Voice Memos (iOS 26)', url: 'https://support.apple.com/guide/iphone/edit-or-delete-a-recording-iphc9bdaee83/26/ios/26' }))
	}
};
