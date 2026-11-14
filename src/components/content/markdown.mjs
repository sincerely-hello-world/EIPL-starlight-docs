import { markdownToMdast, markdownToHtml } from 'satteri';
import sanitizeHtml from 'sanitize-html';

// Content format normalization only; theme CSS lives in the active theme.
// The rich-text paste handler can retain inline marks while leaving block
// Markdown as literal paragraphs. Recover that specific form without treating
// real rich-text headings, lists, images, or custom blocks as Markdown source.
export function pastedMarkdown(value) {
	if (!Array.isArray(value) || !value.length || value.some((block) =>
		block._type !== 'block' || !['normal', undefined].includes(block.style) || block.listItem ||
		block.children?.some((span) => span._type !== 'span'))) return null;
	const lines = value.map((block) => (block.children ?? []).map((span) => {
		let text = span.text ?? '';
		for (const mark of span.marks ?? []) {
			if (mark === 'strong') text = `**${text}**`;
			else if (mark === 'em') text = `*${text}*`;
			else if (mark === 'strike-through') text = `~~${text}~~`;
			else if (mark === 'code') {
				const ticks = '`'.repeat(Math.max(1, ...[...text.matchAll(/`+/g)].map((m) => m[0].length + 1)));
				text = `${ticks}${text}${ticks}`;
			} else {
				const definition = block.markDefs?.find((item) => item._key === mark);
				if (definition?._type === 'link') text = `[${text}](<${String(definition.href).replace(/[<>\r\n]/g, '')}>)`;
			}
		}
		return text;
	}).join(''));
	const headings = lines.filter((line) => /^#{1,6}\s+/.test(line)).length;
	if (!(headings >= 2 || headings && lines.some((line) => /^(`{3,}|~{3,}|:::(note|tip|caution|danger)|\|)/.test(line)))) return null;
	let fence;
	let source = '';
	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		const marker = line.match(/^\s*(`{3,}|~{3,})/);
		if (index) source += fence || /^\s*\|/.test(line) && /^\s*\|/.test(lines[index - 1]) ? '\n' : '\n\n';
		source += line;
		if (marker) {
			if (!fence) fence = marker[1];
			else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && /^\s*(`+|~+)\s*$/.test(line)) fence = undefined;
		}
	}
	return source;
}

export function safeMarkdownHtml(source) {
	return sanitizeHtml(markdownToHtml(source, { features: { rawHtml: true } }).html, {
		allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'details', 'summary', 'input'],
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			img: ['src', 'alt', 'title', 'width', 'height'],
			input: ['type', 'checked', 'disabled'],
			td: ['align', 'style'], th: ['align', 'style'],
		},
		allowedStyles: { '*': { 'text-align': [/^(left|center|right)$/] } },
		transformTags: { input: (_tag, attrs) => ({ tagName: 'input', attribs: {
			type: 'checkbox', disabled: '', ...('checked' in attrs ? { checked: '' } : {}),
		} }) },
	});
}

// Render structural Markdown with Starlight's public components. Other nodes
// use GFM HTML and Starlight's existing .sl-markdown-content typography.
export function parseMarkdown(source) {
	const root = markdownToMdast(source, { features: { directive: true } });
	const headings = [];
	const ids = new Map();
	const text = (node) => node.value ?? (node.children ?? []).map(text).join('');
	const slice = (node) => source.slice(node.position.start.offset, node.position.end.offset);
	function parts(nodes) {
		const output = [];
		let ordinary = [];
		const flush = () => {
			if (ordinary.length) output.push({ type: 'html', html: safeMarkdownHtml(ordinary.join('\n\n')) });
			ordinary = [];
		};
		for (const node of nodes) {
			if (node.type === 'code' && node.value.trim()) {
				flush();
				output.push({ type: 'code', code: node.value, lang: node.lang || 'text', meta: node.meta || '' });
			} else if (node.type === 'heading') {
				flush();
				const label = text(node);
				const base = label.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-') || 'section';
				const count = ids.get(base) ?? 0;
				ids.set(base, count + 1);
				const slug = count ? `${base}-${count}` : base;
				headings.push({ depth: node.depth, slug, text: label });
				const html = safeMarkdownHtml(slice(node)).replace(/^<h[1-6]>/, '').replace(/<\/h[1-6]>\s*$/, '');
				output.push({ type: 'heading', level: node.depth, slug, html });
			} else if (node.type === 'containerDirective' && ['note', 'tip', 'caution', 'danger'].includes(node.name)) {
				flush();
				const children = [...node.children];
				const title = children[0]?.data?.directiveLabel ? text(children.shift()) : undefined;
				output.push({ type: 'aside', variant: node.name, title, parts: parts(children) });
			} else if (!['yaml', 'toml'].includes(node.type)) ordinary.push(slice(node));
		}
		flush();
		return output;
	}
	return { parts: parts(root.children), headings };
}
