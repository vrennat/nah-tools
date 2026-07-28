import type { ConversionPair } from './types';

export const allPairs: ConversionPair[] = [
	{
		slug: 'heic-to-jpg',
		sourceFormat: 'HEIC',
		targetFormat: 'JPG',
		sourceExtensions: '.heic,.heif',
		sourceMimeTypes: 'image/heic,image/heif',
		targetCodec: 'jpeg',
		defaultQuality: 85,
		supportsQuality: true,
		title: 'Convert HEIC to JPG',
		description: 'Convert HEIC photos from iPhone to universally compatible JPG',
		popular: true,
		faqOverrides: {
			useCase:
				"iPhones save photos as HEIC by default (Apple's format since iOS 11), using HEVC compression that runs roughly half the file size of an equivalent JPEG. The catch is compatibility: Windows, most Android devices, and a long list of upload forms don't recognize .heic at all. Drop your photos here and get JPGs that open everywhere, no codec pack or Apple software required.",
			extraQuestion: {
				question: 'Does converting HEIC to JPG lose quality twice?',
				answer:
					"A little. Browsers can't decode HEIC natively, so this tool first converts it to an intermediate JPEG at 95% quality, then re-encodes that to your chosen output quality — two lossy passes instead of one. At the default 85% output quality the second pass is the only one you'd ever notice, and even that's rarely visible."
			}
		}
	},
	{
		slug: 'heic-to-png',
		sourceFormat: 'HEIC',
		targetFormat: 'PNG',
		sourceExtensions: '.heic,.heif',
		sourceMimeTypes: 'image/heic,image/heif',
		targetCodec: 'png',
		defaultQuality: 95,
		supportsQuality: false,
		title: 'Convert HEIC to PNG',
		description: 'Convert HEIC photos to lossless PNG',
		popular: true,
		faqOverrides: {
			useCase:
				"Converting to PNG instead of JPG makes sense when a HEIC photo is headed into an editor for further work — PNG's lossless encoding means every subsequent save keeps exactly the pixels you have, instead of compounding new JPEG artifacts each time the way re-saving a JPG repeatedly would.",
			extraQuestion: {
				question: 'Is this actually lossless from my original HEIC?',
				answer:
					"Not quite, and it's worth knowing why. Browsers have no native HEIC decoder, so this tool first converts your HEIC to an intermediate JPEG at 95% quality before decoding and re-encoding it as PNG. The PNG step itself is lossless, but that 95%-quality bridge means the very first generation isn't bit-for-bit identical to the original — any edits you make to the PNG afterward won't lose anything further, though."
			}
		}
	},
	{
		slug: 'webp-to-png',
		sourceFormat: 'WebP',
		targetFormat: 'PNG',
		sourceExtensions: '.webp',
		sourceMimeTypes: 'image/webp',
		targetCodec: 'png',
		defaultQuality: 95,
		supportsQuality: false,
		title: 'Convert WebP to PNG',
		description: 'Convert WebP images to PNG for universal compatibility',
		popular: true,
		faqOverrides: {
			useCase:
				"Right-click-save on the web often hands you a .webp file, and a fair amount of older software — some Photoshop and GIMP versions, print workflows, certain CMS media pickers — still won't open it. PNG opens everywhere, and since both formats support transparency, any alpha channel in your WebP carries straight through.",
			extraQuestion: {
				question: 'Will transparency survive the conversion?',
				answer:
					'Yes. WebP and PNG both support an alpha channel, and the decode-then-encode pipeline preserves it exactly. A fully opaque WebP produces a fully opaque PNG; partial transparency stays partial.'
			}
		}
	},
	{
		slug: 'webp-to-jpg',
		sourceFormat: 'WebP',
		targetFormat: 'JPG',
		sourceExtensions: '.webp',
		sourceMimeTypes: 'image/webp',
		targetCodec: 'jpeg',
		defaultQuality: 85,
		supportsQuality: true,
		title: 'Convert WebP to JPG',
		description: 'Convert WebP to JPG for wider support',
		popular: false,
		faqOverrides: {
			useCase:
				'JPG is still the one format guaranteed to open in absolutely everything — every browser, every OS photo viewer, every print shop upload form. Converting a WebP image to JPG trades a bit of file size for that universal compatibility.',
			extraQuestion: {
				question: 'What happens to transparency when converting to JPG?',
				answer:
					'It\'s discarded. JPEG has no alpha channel, so any transparent or semi-transparent areas in the source WebP become fully opaque in the output. If you need to keep transparency, convert to PNG instead.'
			}
		}
	},
	{
		slug: 'png-to-webp',
		sourceFormat: 'PNG',
		targetFormat: 'WebP',
		sourceExtensions: '.png',
		sourceMimeTypes: 'image/png',
		targetCodec: 'webp',
		defaultQuality: 80,
		supportsQuality: true,
		title: 'Convert PNG to WebP',
		description: 'Convert PNG to WebP for smaller file sizes',
		popular: false,
		faqOverrides: {
			useCase:
				"PNG screenshots and design exports are often far larger than they need to be for the web — WebP's lossy mode typically holds visual quality close to the PNG source at a fraction of the file size, which is why most modern sites serve WebP instead of PNG for anything that doesn't need to be pixel-perfect.",
			extraQuestion: {
				question: 'Is this lossy or lossless WebP?',
				answer:
					'Lossy, controlled by the quality slider (default 80%). For screenshots and UI mockups with large flat-color areas, 80% or higher is usually indistinguishable from the PNG source at a fraction of the size.'
			}
		}
	},
	{
		slug: 'jpg-to-webp',
		sourceFormat: 'JPG',
		targetFormat: 'WebP',
		sourceExtensions: '.jpg,.jpeg',
		sourceMimeTypes: 'image/jpeg',
		targetCodec: 'webp',
		defaultQuality: 85,
		supportsQuality: true,
		title: 'Convert JPG to WebP',
		description: 'Convert JPG to WebP for web optimization',
		popular: false,
		faqOverrides: {
			useCase:
				'Swapping a JPG for WebP at a matched quality setting typically cuts file size by 25–35% with no visible difference — the main reason WebP replaced JPG as the default image format across most website builders and CDNs.',
			extraQuestion: {
				question: 'Do I need a fallback image for older browsers?',
				answer:
					'No. Every current major browser decodes WebP natively, so a straight file swap works without a picture element, polyfill, or JPEG fallback.'
			}
		}
	},
	{
		slug: 'png-to-jpg',
		sourceFormat: 'PNG',
		targetFormat: 'JPG',
		sourceExtensions: '.png',
		sourceMimeTypes: 'image/png',
		targetCodec: 'jpeg',
		defaultQuality: 85,
		supportsQuality: true,
		title: 'Convert PNG to JPG',
		description: 'Convert PNG to JPG, reducing file size',
		popular: false,
		faqOverrides: {
			useCase:
				"Screenshots and phone photos saved as PNG can run 3–5x larger than a visually equivalent JPEG, since PNG's lossless compression can't compete with JPEG's lossy encoding on photographic content. Converting to JPG is the fastest way to shrink them before uploading or emailing.",
			extraQuestion: {
				question: 'What happens to transparent areas in my PNG?',
				answer:
					"They're lost. JPEG has no alpha channel, so any transparency in the source PNG is discarded during encoding and those pixels become fully opaque. If you need to keep a transparent background, stay in PNG or move to WebP instead."
			}
		}
	},
	{
		slug: 'jpg-to-png',
		sourceFormat: 'JPG',
		targetFormat: 'PNG',
		sourceExtensions: '.jpg,.jpeg',
		sourceMimeTypes: 'image/jpeg',
		targetCodec: 'png',
		defaultQuality: 95,
		supportsQuality: false,
		title: 'Convert JPG to PNG',
		description: 'Convert JPG to lossless PNG',
		popular: false,
		faqOverrides: {
			useCase:
				"Converting a JPG to PNG can't undo compression artifacts already baked into the file, but it stops the bleeding: PNG's lossless encoding means every further edit and re-save keeps exactly the pixels you have now, instead of stacking new JPEG artifacts on top of old ones each time you save.",
			extraQuestion: {
				question: "Will this improve my JPG's quality?",
				answer:
					"No — data lost to JPEG compression can't be recovered. What it does is freeze the current quality in place, so future edits and saves don't add further generation loss the way repeatedly re-saving as JPEG would."
			}
		}
	},
	{
		slug: 'svg-to-png',
		sourceFormat: 'SVG',
		targetFormat: 'PNG',
		sourceExtensions: '.svg',
		sourceMimeTypes: 'image/svg+xml',
		targetCodec: 'png',
		defaultQuality: 95,
		supportsQuality: false,
		title: 'Convert SVG to PNG',
		description: 'Rasterize SVG to PNG at any resolution',
		popular: true,
		faqOverrides: {
			useCase:
				"SVG is ideal for logos and icons because it scales to any size without blurring, but plenty of places won't take it — social upload fields, some CMS image pickers, most print workflows. This rasterizes your SVG to PNG at its rendered pixel dimensions.",
			extraQuestion: {
				question: 'Why did my PNG come out tiny or blurry?',
				answer:
					'If your SVG file only has a viewBox and no explicit width/height attributes, browsers rasterize it at a default size of 300×150 pixels, and scaling that up afterward looks blurry. Add explicit width and height attributes to the SVG (e.g. width="1024" height="1024") before converting for a sharp, correctly sized PNG.'
			}
		}
	},
	{
		slug: 'avif-to-png',
		sourceFormat: 'AVIF',
		targetFormat: 'PNG',
		sourceExtensions: '.avif',
		sourceMimeTypes: 'image/avif',
		targetCodec: 'png',
		defaultQuality: 95,
		supportsQuality: false,
		title: 'Convert AVIF to PNG',
		description: 'Convert AVIF to widely supported PNG',
		popular: false,
		faqOverrides: {
			useCase:
				"AVIF has become common for images downloaded from modern websites, since it compresses more efficiently than JPEG or WebP at equivalent visual quality — but older image editors, some CMS platforms, and most print workflows still don't recognize it. Converting to PNG gets you a format that opens everywhere.",
			extraQuestion: {
				question: 'Does this preserve transparency from the source AVIF?',
				answer:
					'Yes. AVIF supports an alpha channel, and since PNG does too, any transparency carries straight through the conversion.'
			}
		}
	},
	{
		slug: 'avif-to-jpg',
		sourceFormat: 'AVIF',
		targetFormat: 'JPG',
		sourceExtensions: '.avif',
		sourceMimeTypes: 'image/avif',
		targetCodec: 'jpeg',
		defaultQuality: 85,
		supportsQuality: true,
		title: 'Convert AVIF to JPG',
		description: 'Convert AVIF to JPG',
		popular: false,
		faqOverrides: {
			useCase:
				"AVIF files are efficient to store but awkward to share — older phones, some Windows photo viewers, and most non-web software still can't open them. JPG remains the safest universal choice when the image just needs to open, everywhere, without asking anyone to update anything.",
			extraQuestion: {
				question: 'What happens to transparency in an AVIF source?',
				answer:
					'It\'s discarded. JPEG has no alpha channel, so any transparent areas in the AVIF become fully opaque in the output. Convert to PNG instead if you need to keep transparency.'
			}
		}
	},
	{
		slug: 'png-to-avif',
		sourceFormat: 'PNG',
		targetFormat: 'AVIF',
		sourceExtensions: '.png',
		sourceMimeTypes: 'image/png',
		targetCodec: 'avif',
		defaultQuality: 65,
		supportsQuality: true,
		title: 'Convert PNG to AVIF',
		description: 'Convert PNG to AVIF for maximum compression',
		popular: false,
		faqOverrides: {
			useCase:
				'AVIF is currently one of the most space-efficient photographic formats in mainstream use, often producing smaller files than an equivalent WebP at matched visual quality. Converting a PNG export or screenshot to AVIF is worth it for anything headed to a modern website — every major current browser decodes AVIF natively.',
			extraQuestion: {
				question: 'Is AVIF the right choice for every image?',
				answer:
					"It's strongest on photos and complex images with gradients and fine detail — the same content JPEG and WebP handle well. For flat-color graphics like icons or line art, PNG or SVG can still end up smaller; AVIF's advantage comes from how it handles photographic complexity, not simple graphics."
			}
		}
	},
	{
		slug: 'jpg-to-avif',
		sourceFormat: 'JPG',
		targetFormat: 'AVIF',
		sourceExtensions: '.jpg,.jpeg',
		sourceMimeTypes: 'image/jpeg',
		targetCodec: 'avif',
		defaultQuality: 65,
		supportsQuality: true,
		title: 'Convert JPG to AVIF',
		description: 'Convert JPG to AVIF for smaller files',
		popular: false,
		faqOverrides: {
			useCase:
				"At matched visual quality, AVIF files typically run 20–50% smaller than the equivalent JPEG, which is why AVIF has become a default optimization target for image-heavy websites. This re-encodes your JPG's pixel data into AVIF, with the quality slider controlling the size-versus-quality trade-off.",
			extraQuestion: {
				question: 'Why does AVIF take longer to encode than JPEG or WebP?',
				answer:
					"AVIF's encoder does substantially more analysis per image to achieve its smaller file sizes, so encoding is slower than JPEG or WebP — noticeable on large images or batches, even though it's all running locally in your browser."
			}
		}
	},
	{
		slug: 'jxl-to-png',
		sourceFormat: 'JPEG XL',
		targetFormat: 'PNG',
		sourceExtensions: '.jxl',
		sourceMimeTypes: 'image/jxl',
		targetCodec: 'png',
		defaultQuality: 95,
		supportsQuality: false,
		title: 'Convert JPEG XL to PNG',
		description: 'Convert JPEG XL to PNG',
		popular: false,
		faqOverrides: {
			useCase:
				"JPEG XL is a newer format designed for smaller files and lossless recompression of existing JPEGs, but most browsers still don't display it in a normal tab — Safari has partial support, and Chrome and Firefox generally don't render it natively. This converts a .jxl file to PNG so you can actually view or use it anywhere.",
			extraQuestion: {
				question: 'How does this decode JPEG XL if my browser can\'t?',
				answer:
					"It doesn't rely on the browser's built-in image decoder at all — decoding runs through a WebAssembly build of the JPEG XL codec shipped with the page, so it works the same in Chrome, Firefox, or Safari regardless of which one has native format support."
			}
		}
	},
	{
		slug: 'bmp-to-png',
		sourceFormat: 'BMP',
		targetFormat: 'PNG',
		sourceExtensions: '.bmp',
		sourceMimeTypes: 'image/bmp',
		targetCodec: 'png',
		defaultQuality: 95,
		supportsQuality: false,
		title: 'Convert BMP to PNG',
		description: 'Convert BMP to compressed PNG',
		popular: false,
		faqOverrides: {
			useCase:
				'BMP is an old Windows format that stores images with little or no compression, so files often run 5–10x larger than a PNG of the same picture. Converting screenshots or scans out of BMP is one of the easiest wins for cutting file size without losing quality.',
			extraQuestion: {
				question: 'Will I lose quality converting BMP to PNG?',
				answer:
					"No. Most BMP files are stored uncompressed, and PNG's compression is lossless, so the pixel data carries over exactly — same image, much smaller file."
			}
		}
	},
	{
		slug: 'gif-to-png',
		sourceFormat: 'GIF',
		targetFormat: 'PNG',
		sourceExtensions: '.gif',
		sourceMimeTypes: 'image/gif',
		targetCodec: 'png',
		defaultQuality: 95,
		supportsQuality: false,
		title: 'Convert GIF to PNG',
		description: 'Convert GIF to PNG',
		popular: false,
		faqOverrides: {
			useCase:
				"A GIF's color palette is capped at 256 colors, which is why gradients and photos saved as GIF often show visible banding. Converting a non-animated GIF to PNG lifts that cap to full 24-bit color and fixes the banding.",
			extraQuestion: {
				question: 'What happens if I convert an animated GIF?',
				answer:
					"Only the first frame comes through. Browsers decode a single static image from a GIF regardless of how many frames it has, so this tool has no way to preserve animation — an animated GIF needs to stay a GIF, or be converted to video, to keep moving."
			}
		}
	},
	{
		slug: 'tiff-to-jpg',
		sourceFormat: 'TIFF',
		targetFormat: 'JPG',
		sourceExtensions: '.tiff,.tif',
		sourceMimeTypes: 'image/tiff',
		targetCodec: 'jpeg',
		defaultQuality: 85,
		supportsQuality: true,
		title: 'Convert TIFF to JPG',
		description: 'Convert TIFF to compressed JPG',
		popular: false
	}
];

export function getPair(slug: string): ConversionPair | undefined {
	return allPairs.find((p) => p.slug === slug);
}
