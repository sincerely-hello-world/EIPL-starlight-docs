import test from 'node:test';
import assert from 'node:assert/strict';
import { pastedMarkdown, parseMarkdown, safeMarkdownHtml } from '../src/components/content/markdown.mjs';

const paragraph = (text, extra = {}) => ({ _type: 'block', style: 'normal', children: [{ _type: 'span', text }], ...extra });

test('pasted source becomes headings, Starlight asides, code metadata and a table', () => {
	const source = pastedMarkdown([
		'## 提示', ':::tip[说明]', '正文', ':::', '## 代码',
		'````md title="示例"', '```js', 'const a = 1;', '```', '````',
		'| 名称 | 值 |', '| --- | --- |', '| a | b |',
	].map((text) => paragraph(text)));
	const result = parseMarkdown(source);
	assert.deepEqual(result.headings.map((heading) => heading.text), ['提示', '代码']);
	const aside = result.parts.find((part) => part.type === 'aside');
	assert.equal(aside.variant, 'tip');
	assert.equal(aside.title, '说明');
	const code = result.parts.find((part) => part.type === 'code');
	assert.equal(code.code, '```js\nconst a = 1;\n```');
	assert.equal(code.meta, 'title="示例"');
	assert.match(result.parts.at(-1).html, /<table>/);
});

test('genuine rich text and ordinary prose keep the Portable Text renderer', () => {
	assert.equal(pastedMarkdown([paragraph('just text')]), null);
	assert.equal(pastedMarkdown([paragraph('Heading', { style: 'h2' }), paragraph('## literal')]), null);
	assert.equal(pastedMarkdown([{ _type: 'code', code: '## source' }]), null);
	assert.equal(pastedMarkdown([paragraph('## List'), paragraph('- item', { listItem: 'bullet' })]), null);
});

test('inline formatting retained by the editor is recovered as Markdown', () => {
	const block = paragraph('', { children: [
		{ _type: 'span', text: 'bold', marks: ['strong'] },
		{ _type: 'span', text: 'code', marks: ['code'] },
		{ _type: 'span', text: 'docs', marks: ['link'] },
	], markDefs: [{ _key: 'link', _type: 'link', href: '/guides/' }] });
	const result = parseMarkdown(pastedMarkdown([paragraph('## One'), block, paragraph('## Two')]));
	const html = result.parts.find((part) => part.type === 'html').html;
	assert.match(html, /<strong>bold<\/strong>/);
	assert.match(html, /<code>code<\/code>/);
	assert.match(html, /href="\/guides\/"/);
});

test('repeated Chinese headings have unique anchors and fenced headings are not a TOC', () => {
	const result = parseMarkdown('## 标题\n\n## 标题\n\n```md\n## Not a heading\n```');
	assert.deepEqual(result.headings.map((heading) => heading.slug), ['标题', '标题-1']);
});

test('safe details survive; scripts, event handlers and javascript links do not', () => {
	const html = safeMarkdownHtml('<details><summary>展开</summary>正文</details>\n\n<script>alert(1)</script>\n\n<img src="/test.png" onerror="alert(1)">\n\n[bad](javascript:alert%281%29)');
	assert.match(html, /<details><summary>展开<\/summary>/);
	assert.doesNotMatch(html, /<script|onerror|javascript:/i);
});

test('table alignment and task state survive without allowing arbitrary CSS or live form inputs', () => {
	const html = safeMarkdownHtml('| a | b |\n| :--- | ---: |\n| 1 | 2 |\n\n- [x] done\n\n<td style="position:fixed;text-align:center" onclick="alert(1)">cell</td>');
	assert.match(html, /text-align:right/);
	assert.match(html, /checked/);
	assert.match(html, /disabled/);
	assert.doesNotMatch(html, /position:|onclick/);
});
