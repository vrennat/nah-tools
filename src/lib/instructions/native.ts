import type { NativeMethod, Platform } from './types';
import { mediaNativeInstructions } from './native-media';
const method = (title: string, steps: string[], caveat: string, source: NativeMethod['source'], kind: NativeMethod['kind'] = 'built-in'): NativeMethod => ({ kind, title, steps, caveat, source, checked: '2026-10-31' });
const apple = (title: string, page: string) => ({ title: `Apple: ${title}`, url: `https://support.apple.com/guide/preview/${page}/mac` });
const pages = apple('Add, delete, or move PDF pages', 'prvw11793');
const iosPages = { title: 'Apple: PDF pages in Preview (iOS 26)', url: 'https://support.apple.com/en-ph/guide/iphone/iphbf4977cff/26/ios/26' };
const windowsPhotos = { title: 'Microsoft: Edit photos and videos in Windows', url: 'https://support.microsoft.com/en-us/windows/apps/photos/edit-photos-and-videos-in-windows' };
const googlePhotos = { title: 'Google: Edit your photos on Android', url: 'https://support.google.com/photos/answer/6128850?co=GENIE.Platform%3DAndroid&hl=en' };
const iosPhotos = { title: 'Apple: Edit photos and videos (iOS 26)', url: 'https://support.apple.com/en-sg/guide/iphone/iphb08064d57/26/ios/26' };
const macLimit = 'Preview on Mac. Work on a duplicate if you want to keep the original; document permissions can restrict edits.';
const iosLimit = 'Requires Preview on iOS 26. Duplicate the PDF first to keep an untouched original.';
const winLimit = 'Current Microsoft Photos on Windows; update the app if these controls are missing. Save a copy to retain the original.';
const androidLimit = 'Requires the Google Photos app, which may need installation. Controls vary by app version; backup can sync edits to your Google Account.';
const convert = method('Export an image with Preview', ['Open the image in Preview and choose File > Export.', 'Choose the destination format, adjust available options, and save under a new name.'], 'Preview supports selected formats including HEIC, JPEG, PNG, TIFF, and PDF. Available output formats depend on the image; JPEG removes transparency.', apple('Convert image file types', 'prvw1012'));

// Reuse methods across equivalent routes rather than duplicating source-derived instructions.
const coreNativeInstructions: Record<string, Partial<Record<Platform, NativeMethod>>> = {
	'/pdf/merge': {
		mac: method('Combine PDFs in Preview', ['Open both PDFs in Preview and choose View > Thumbnails.', 'Drag page thumbnails from one document into the other at the desired position, then save.'], macLimit, pages),
		ios: method('Insert a PDF with Preview', ['Open the destination PDF in Preview and tap the page count.', 'Touch and hold a thumbnail, choose Insert from File, and select the other PDF.'], iosLimit, iosPages)
	},
	'/pdf/split': {
		windows: method('Save selected PDF pages with Edge', ['Open the PDF in Edge and press Ctrl+P.', 'Choose Save as PDF or Microsoft Print to PDF, enter a custom page range, and save a new file. Repeat for other ranges.'], 'Reprints selected pages rather than extracting them losslessly. Forms, bookmarks, tags, links, and signatures may be lost. Does not bypass a password.', { title: 'Microsoft: Print in Microsoft Edge', url: 'https://support.microsoft.com/en-us/edge/print-in-microsoft-edge' }), mac: method('Extract pages with Preview', ['Open the PDF and choose View > Thumbnails.', 'Select the desired thumbnails and drag them to the desktop to create a new PDF.'], 'Preview on Mac. Repeat for each output document; this is manual page extraction.', pages) },
	'/pdf/remove-pages': {
		mac: method('Delete pages in Preview', ['Open a duplicate PDF and choose View > Thumbnails.', 'Select unwanted pages, press Delete, then save.'], macLimit, pages),
		ios: method('Delete pages in Preview', ['Open a duplicate PDF in Preview and tap its page count.', 'Touch and hold an unwanted thumbnail and tap Delete Page.'], iosLimit, iosPages)
	},
	'/pdf/reorder': {
		mac: method('Reorder pages in Preview', ['Open the PDF and choose View > Thumbnails.', 'Drag thumbnails into the desired order and save.'], macLimit, pages),
		ios: method('Move pages in Preview', ['Open the PDF and show thumbnails using the page count.', 'Touch and hold a thumbnail, then drag it above or below another page.'], iosLimit, iosPages)
	},
	'/pdf/rotate': {
		mac: method('Rotate pages in Preview', ['Open the PDF and select page thumbnails.', 'Click Rotate Left; hold Option for Rotate Right. Save the document.'], macLimit, apple('Crop or rotate a PDF', 'prvw11567')),
		ios: method('Rotate a page in Preview', ['Open the PDF to the page you want to rotate.', 'Tap More, then Rotate Left or Rotate Right.'], iosLimit, iosPages)
	},
	'/pdf/crop': {
		mac: method('Crop a PDF with Preview (macOS 27)', ['Show the Markup toolbar and use Rectangular Selection to choose the area to keep.', 'Click Crop and save a copy.'], 'macOS 27 instructions. Cropping hides content; it does not redact it.', { title: 'Apple: Crop or rotate a PDF (macOS 27)', url: 'https://support.apple.com/en-gb/guide/preview/prvw11567/11.0/mac/27' }), ios: method('Crop a PDF page in Preview', ['Open the PDF to the page and tap Crop.', 'Drag the blue handles, tap inside the selection if needed, then tap Crop.'], `${iosLimit} Cropping changes the visible page area; it is not redaction.`, iosPages) },
	'/pdf/compress': {
		ios: method('Optimize a PDF with Preview (iOS 27)', ['Choose Export > PDF.', 'Enable Optimize Images for Screen and/or Save Images as JPEG, then tap Done and save a new copy. Inspect its quality and size.'], 'iOS 27 only. Image optimization can lose quality; linearization does not guarantee a smaller file.', { title: 'Apple: Export in Preview (iOS 27)', url: 'https://support.apple.com/en-ie/guide/iphone/iph61c20afe1/27/ios/27' }), mac: method('Reduce PDF size in Preview', ['Open the PDF and choose File > Export.', 'Choose Quartz Filter > Reduce File Size, then save with a new name.'], 'Preview on Mac. Compression can reduce image quality, and the size reduction varies.', apple('Reduce the size of a PDF', 'prvw1509')) },
	'/pdf/fill-sign': { mac: method('Fill and sign with Preview', ['Open the PDF in Preview and fill any available form fields.', 'Show the Markup toolbar, choose Sign, create or select a signature, and place it on the page.'], 'Preview on Mac. A drawn signature is not a certificate-based digital signature; some forms restrict editing.', apple('Fill out and sign PDF forms', 'prvw35725')) },
	'/pdf/protect': {
		ios: method('Lock a PDF with Preview (iOS 26)', ['Duplicate the PDF, open the filename actions, and choose Lock > Require Password.', 'Enter matching Password and Verify values, then tap Done.'], 'Requires iOS 26 Preview. Keep the password safely; there is no password recovery.', { title: 'Apple: Lock PDFs in Preview (iOS 26)', url: 'https://support.apple.com/en-lamr/guide/iphone/iphe85f2ea31/26/ios/26' }), mac: method('Add a PDF opening password', ['In Preview choose File > Export, enter a new filename, and click Permissions.', 'Enable Require Password To Open Document and confirm the password. Set the owner password, click Apply, then Save.'], 'Preview on Mac. Keep the passwords safely; the opening password takes effect when the saved PDF is reopened.', apple('Password-protect a PDF', 'prvw587dd90f')) },
	'/photo/crop': {
		mac: method('Crop with Preview', ['Open the image and show the Markup toolbar.', 'Use Rectangular Selection to select the area to keep, then click Crop.'], 'Preview on Mac. Keep a duplicate before saving if you need the full image later.', apple('Crop, resize, or rotate an image', 'prvw2015')),
		windows: method('Crop with Microsoft Photos', ['Open the photo in Photos and select Edit image (Ctrl+E).', 'Choose Crop, adjust the borders or aspect ratio, and save a copy.'], winLimit, windowsPhotos),
		ios: method('Crop with Photos', ['Open the photo in Photos and tap Edit, then Crop.', 'Adjust the crop frame and tap Done.'], 'Photos on iOS 26. Revert restores the original while it remains in your library.', iosPhotos),
		android: method('Crop with Google Photos', ['Open the photo in Google Photos and tap Edit > Crop.', 'Drag the crop handles and save, using Save as copy to keep a separate original.'], androidLimit, googlePhotos, 'app')
	},
	'/photo/filters': {
		windows: method('Apply a Photos filter', ['Open the photo in Photos and select Edit image (Ctrl+E).', 'Choose Filter, select a look, and save a copy.'], winLimit, windowsPhotos),
		ios: method('Apply a Photos filter', ['Open the photo in Photos and tap Edit > Filters.', 'Choose a filter, adjust its intensity, and tap Done.'], 'Photos on iOS 26. Filter choices differ from browser presets.', iosPhotos),
		android: method('Apply a Google Photos filter', ['Open the photo in Google Photos and tap Edit.', 'Choose Filters, select a look, then save or save a copy.'], androidLimit, googlePhotos, 'app')
	},
	'/photo/rm-bg': { windows: method('Remove a background with Photos', ['Open the image in Photos and select Edit image > Background.', 'Choose Remove, refine the selection with the background brush if needed, and select Apply. Save a copy.'], `${winLimit} Automatic subject selection may need correction.`, windowsPhotos) },
	'/media/trim-video': {
		mac: method('Trim with QuickTime Player', ['Open the video in QuickTime Player and choose Edit > Trim.', 'Drag the yellow ends to keep the desired section, click Trim, and save a copy.'], 'Requires a QuickTime-compatible input. Trims the beginning and end.', { title: 'Apple: Trim a movie in QuickTime Player', url: 'https://support.apple.com/guide/quicktime-player/qtpf2115f6fd/mac' }),
		ios: method('Trim with Photos', ['Open the video in Photos and tap Edit.', 'Drag the timeline ends, tap Done, and choose Save Video as New Clip.'], 'Photos on iPhone or iPad. This trims the beginning and end, rather than removing a middle section.', { title: 'Apple: Edit videos on iPhone, iPad, or Mac', url: 'https://support.apple.com/en-ie/104968' }),
		windows: method('Trim with Microsoft Photos', ['Open the video in Photos and select Trim (Ctrl+E).', 'Move the start and end sliders and choose Save as Copy.'], winLimit, windowsPhotos),
		android: method('Trim with Google Photos', ['Open the video in Google Photos.', 'Drag the trim handles to keep the desired section, then tap Save.'], 'Requires the Google Photos app. Editor support varies; Google excludes non-Pixel Android 9 devices from video editing.', { title: 'Google: Edit your videos on Android', url: 'https://support.google.com/photos/answer/10729480?hl=en' }, 'app')
	},

	'/pdf/redact': { mac: method('Preview text redaction (macOS 27)', ['Duplicate the PDF. In Markup, choose Redaction Selection and select sensitive text; do not cover it with a black rectangle.', 'Close to commit, reopen, and test search and copy. Check the table of contents too.'], 'macOS 27 instructions. Apple says linked table-of-contents entries remain. Check metadata, attachments, and other copies separately; this is not a sanitization guarantee.', { title: 'Apple: Annotate a PDF (macOS 27)', url: 'https://support.apple.com/en-au/guide/preview/prvw11580/11.0/mac/27' }) },
	'/pdf/unlock': { mac: method('Remove a known PDF opening password', ['Open the PDF using a password you are authorized to use.', 'Choose File > Edit Permissions, remove the opening-password requirement if allowed, then Apply and save a copy. Reopen to verify.'], 'Preview on Mac. May require the owner password. This does not recover an unknown password.', { title: 'Apple: Password-protect a PDF', url: 'https://support.apple.com/en-tm/guide/preview/prvw587dd90f/mac' }) },
	'/pdf/images-to-pdf': { mac: method('Export an image as PDF with Preview', ['Open the image in Preview and choose File > Export > Format > PDF.', 'Save and review the PDF. For multiple images, convert each separately, then merge the PDFs.'], 'macOS 26 instructions. This recipe converts one image at a time.', { title: 'Apple: Convert image file types (macOS 26)', url: 'https://support.apple.com/en-gb/guide/preview/prvw1012/11.0/mac/26' }) },
	'/pdf/ocr': { ios: method('Embed recognized text with Preview (iOS 27)', ['Open the PDF and choose Export > PDF.', 'Enable Embed Text, tap Done, save, and check the recognized text.'], 'iOS 27 only. OCR can misread text; proofread the result.', { title: 'Apple: Export in Preview (iOS 27)', url: 'https://support.apple.com/en-ie/guide/iphone/iph61c20afe1/27/ios/27' }) },
	'/media/compress-video': { mac: method('Export a smaller resolution with QuickTime', ['Open the movie and choose File > Export As.', 'Choose a lower resolution such as 720p or 480p, save a copy, and inspect the result.'], 'QuickTime-compatible input required. Produces MOV, not MP4. No target file size or guaranteed size reduction.', { title: 'Apple: Export movies with QuickTime Player', url: 'https://support.apple.com/guide/quicktime-player/export-movies-qtp20e395859/mac' }) },
	'/media/extract-audio': { mac: method('Export audio with QuickTime', ['Open the movie and choose File > Export As > Audio Only.', 'Save a copy and check playback.'], 'QuickTime-compatible input required. Output is M4A with AAC audio, not MP3, WAV, or FLAC.', { title: 'Apple: Export movies with QuickTime Player', url: 'https://support.apple.com/guide/quicktime-player/export-movies-qtp20e395859/mac' }) },
	'/convert/heic-to-jpg': { mac: convert },
	'/convert/heic-to-png': { mac: convert },
	'/convert/png-to-jpg': { mac: convert },
	'/convert/jpg-to-png': { mac: convert }
};

coreNativeInstructions['/pdf/ocr'].mac = method('Embed recognized text with Preview (macOS 27)', [
	'Open a copy of the PDF in Preview and choose File > Export.',
	'Enable Embed Text if offered, save a new PDF, and check search and copy in the result.'
], 'macOS 27 only. This option applies when no text has previously been recognized; it is not a verified OCR method for mixed text-and-scan documents. Proofread recognition errors.', { title: 'Apple: Recognize text in a PDF (macOS 27)', url: 'https://support.apple.com/en-az/guide/preview/prvw1ddb1cdf/11.0/mac/27' });

export const nativeInstructions: Record<string, Partial<Record<Platform, NativeMethod>>> = { ...coreNativeInstructions };
for (const [path, methods] of Object.entries(mediaNativeInstructions)) {
	nativeInstructions[path] = { ...nativeInstructions[path], ...methods };
}
