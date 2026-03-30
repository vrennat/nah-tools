import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({
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
			$remove: 'src/lib/remove',
			$resume: 'src/lib/resume',
			$bio: 'src/lib/bio',
			$server: 'src/lib/server',
			$utils: 'src/lib/utils'
		}
	}
};

export default config;
