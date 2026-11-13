import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({
			// The Workers AI binding is remote-only. Without this, prerendering and
			// `vite dev` open a remote wrangler session, which needs a Cloudflare
			// login. Locally the AI binding is then absent and the link spam gate
			// holds new links as 'unchecked'; the deployed Worker has the binding.
			platformProxy: { remoteBindings: false },
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		}),
		alias: {
			$components: 'src/lib/components',
			$photo: 'src/lib/photo',
			$compress: 'src/lib/compress',
			$filters: 'src/lib/filters',
			$qr: 'src/lib/qr',
			$pdf: 'src/lib/pdf',
			$pptx: 'src/lib/pptx',
			$remove: 'src/lib/remove',
			$resume: 'src/lib/resume',
			$bio: 'src/lib/bio',
			$invoice: 'src/lib/invoice',
			$signature: 'src/lib/signature',
			$convert: 'src/lib/convert',
			$media: 'src/lib/media',
			$legalgen: 'src/lib/legal-gen',
			$dev: 'src/lib/dev',
			$text: 'src/lib/text',
			$server: 'src/lib/server',
			$transcribe: 'src/lib/transcribe',
			$utils: 'src/lib/utils'
		}
	}
};

export default config;
