import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { emdashSection } from '../../config/sidebar.mjs';
import { getDocuments } from './documents';

export const onRequest = defineRouteMiddleware(async (context) => {
	const documents = await getDocuments(context.locals);
	const route = context.locals.starlightRoute;
	const normalize = (path: string) => decodeURI(path).replace(/\/+$/, '') || '/';
	const link = (label: string, href: string) => ({
		type: 'link' as const, label, href,
		isCurrent: normalize(href) === normalize(context.url.pathname), badge: undefined, attrs: {},
	});
	const entries = [link('文档总览', emdashSection.path), ...documents.map((doc) => link(doc.title, doc.href))];
	route.sidebar.push({
		type: 'group', label: emdashSection.label, entries, collapsed: false, badge: undefined,
	});
	if (context.url.pathname === '/') route.hasSidebar = true;
	if (context.url.pathname.startsWith(emdashSection.path)) {
		const current = entries.findIndex((entry) => entry.isCurrent);
		route.pagination = { prev: entries[current - 1], next: current < 0 ? undefined : entries[current + 1] };
	}
});
