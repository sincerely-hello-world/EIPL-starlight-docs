import { defineLiveCollection } from 'astro:content';

// Database-backed CMS content coexists with the file-based Starlight docs.
// Only the CMS config registers EmDash's virtual runtime modules. Keep the
// dynamic import inside a build-time branch so static builds never load them.
export const collections = import.meta.env.EMDASH_LOCAL_CMS
	? { _emdash: defineLiveCollection({ loader: (await import('emdash/runtime')).emdashLoader() }) }
	: {};
