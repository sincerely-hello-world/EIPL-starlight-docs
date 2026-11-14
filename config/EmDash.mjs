// Local CMS configuration; Cloudflare will use its own adapter and bindings.
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import emdash, { local } from 'emdash/astro';
import { sqlite } from 'emdash/db';
import { fileURLToPath } from 'node:url';
import { emdashSection } from './sidebar.mjs';

const contentTypes = ['posts', 'pages'];
const sourceFile = (file) => fileURLToPath(new URL(`../src/cms/${file}`, import.meta.url));

export const emdashStarlightOptions = {
	prerender: false,
	// Pagefind cannot index database changes at request time.
	pagefind: false,
	routeMiddleware: sourceFile('sidebar.ts'),
};

export function createEmDashConfig() {
	return defineConfig({
		site: 'http://localhost:4322', base: '/', trailingSlash: 'ignore',
		output: 'server', outDir: './dist-cms',
		adapter: node({ mode: 'standalone' }),
		server: { host: 'localhost', port: 4322 },
		vite: {
			define: {
				'import.meta.env.EMDASH_LOCAL_CMS': 'true',
				'import.meta.env.EMDASH_CONTENT_TYPES': JSON.stringify(contentTypes),
			},
			// Convert the admin's CommonJS client entry to browser ESM.
			optimizeDeps: { include: ['react-dom/client'] },
		},
		integrations: [
			{
				name: 'cms-document-pages',
				hooks: {
					'astro:config:setup': ({ injectRoute, addMiddleware }) => {
						addMiddleware({ entrypoint: sourceFile('middleware.ts'), order: 'post' });
						injectRoute({ pattern: emdashSection.path, entrypoint: sourceFile('pages/index.astro'), prerender: false });
						for (const type of contentTypes) {
							injectRoute({ pattern: `${emdashSection.path}${type}/[...slug]`, entrypoint: sourceFile('pages/document.astro'), prerender: false });
						}
						for (const pattern of ['/posts', '/posts/[...slug]']) {
							injectRoute({ pattern, entrypoint: sourceFile('pages/legacy.astro'), prerender: false });
						}
					},
				},
			},
			react(),
			emdash({
				database: sqlite({ url: 'file:./data.db' }),
				storage: local({ directory: './uploads', baseUrl: '/_emdash/api/media/file' }),
			}),
		],
	});
}
