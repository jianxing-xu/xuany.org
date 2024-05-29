import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import UnoCSS from 'unocss/astro'
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://exquisite-pie-2d2373.netlify.app',
	integrations: [mdx(), sitemap(), UnoCSS({
		injectReset: true
	})],
});
