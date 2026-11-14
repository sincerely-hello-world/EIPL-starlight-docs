// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import sidebar from './config/sidebar.mjs';

// URL paths are deployment settings, independent of package and Worker names.
const base = `/${(process.env.BASE_PATH ?? '').trim().split('/').filter(Boolean).join('/')}`;

// https://astro.build/config
/** @param {Partial<Parameters<typeof starlight>[0]>} starlightOptions */
export function createDocsConfig(starlightOptions = {}) {
	return defineConfig({
		site: process.env.SITE_URL,
		base,
		trailingSlash: 'always',
		// FileTree uses satteri's native binding; keep it in Node during prerendering.
		vite: { ssr: { external: ['satteri'] } },
		markdown: { syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] } },
		integrations: [
			mermaid({ autoTheme: true, enableLog: false }),
			starlight({
				title: 'EIPL-starlight-docs',
				locales: { root: { label: '简体中文', lang: 'zh-CN' } },
				social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/sincerely-hello-world/EIPL-starlight-docs' }],
				sidebar,
				...starlightOptions,
			}),
		],
	});
}

export default createDocsConfig();
