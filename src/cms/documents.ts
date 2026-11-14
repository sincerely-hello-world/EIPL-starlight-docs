import { getEmDashCollection, type PortableTextBlock } from 'emdash';
import { emdashSection } from '../../config/sidebar.mjs';

export const contentTypes = import.meta.env.EMDASH_CONTENT_TYPES as string[];
export interface CmsDocument { title: string; href: string }
export interface CmsDocumentData { title: string; content?: PortableTextBlock[] }

export function documentHref(type: string, id: string) {
	return `${emdashSection.path}${type}/${id.split('/').map(encodeURIComponent).join('/')}/`;
}

// Reuse queries within one request only, never across publishes or users.
const requests = new WeakMap<object, Promise<CmsDocument[]>>();
export function getDocuments(locals: object): Promise<CmsDocument[]> {
	let result = requests.get(locals);
	if (!result) {
		result = loadDocuments();
		requests.set(locals, result);
	}
	return result;
}

async function loadDocuments() {
	const groups = await Promise.all(contentTypes.map(async (type) => {
		const documents: CmsDocument[] = [];
		let cursor: string | undefined;
		do {
			const result = await getEmDashCollection<string, CmsDocumentData>(type, {
				status: 'published', orderBy: { created_at: 'asc' }, limit: 100, cursor,
			});
			if (result.error) throw result.error;
			for (const entry of result.entries) {
				documents.push({ title: entry.data.title, href: documentHref(type, entry.id) });
			}
			cursor = result.hasMore ? result.nextCursor : undefined;
		} while (cursor);
		return documents;
	}));
	return groups.flat();
}
