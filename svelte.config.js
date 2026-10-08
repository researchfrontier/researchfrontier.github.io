import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Pure static SPA: a 404.html fallback serves client-side routes on GitHub Pages.
		adapter: adapter({ fallback: '404.html', precompress: false, strict: false }),
		// Org site lives at the root (researchfrontier.github.io) -> empty base path.
		// For a project page, set BASE_PATH=/researchfrontier-frontend at build time.
		paths: { base: process.env.BASE_PATH ?? '' }
	}
};

export default config;
