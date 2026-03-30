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
			$qr: 'src/lib/qr',
			$server: 'src/lib/server',
			$utils: 'src/lib/utils'
		}
	}
};

export default config;
