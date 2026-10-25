import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Mirror root _headers so worker scripts served by Vite get cross-origin
// isolation in dev/preview (hooks.server.ts only covers SSR responses).
const isolationHeaders = {
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Embedder-Policy': 'credentialless'
};

export default defineConfig({
	server: { headers: isolationHeaders },
	preview: { headers: isolationHeaders },
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['@modelcontextprotocol/sdk']
	},
	optimizeDeps: {
		exclude: [
			'onnxruntime-web',
			'@jsquash/jpeg',
			'@jsquash/webp',
			'@jsquash/avif',
			'@jsquash/png',
			'@jsquash/oxipng',
			'@jsquash/jxl'
		]
	},
	worker: {
		format: 'es'
	}
});
