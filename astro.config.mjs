// filepath: astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://amargo-creativo.pages.dev',
  output: 'server',
  adapter: cloudflare(),
  integrations: [sitemap(), react()],
});

