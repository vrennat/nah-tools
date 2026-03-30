import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
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
