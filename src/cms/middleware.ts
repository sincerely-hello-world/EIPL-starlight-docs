import { defineMiddleware } from 'astro:middleware';

// Every public HTML page contains live CMS navigation. Do not cache it across
// publishes. Leave EmDash's own API and media caching policies to EmDash.
export const onRequest = defineMiddleware(async (context, next) => {
	const response = await next();
	if (!context.url.pathname.startsWith('/_emdash/') && response.headers.get('Content-Type')?.includes('text/html')) {
		response.headers.set('Cache-Control', 'no-store');
	}
	return response;
});
