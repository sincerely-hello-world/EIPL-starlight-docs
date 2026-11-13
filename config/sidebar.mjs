// @ts-check

/** @type {Parameters<typeof import('@astrojs/starlight').default>[0]['sidebar']} */
const sidebar = [
	{ label: '文档首页', slug: '' },
	{
		label: '实验室服务器',
		items: [
			{ slug: 'machine_intro/eipl实验室服务器状态汇总' },
			{
				label: '各机器使用手册',
				items: [{ autogenerate: { directory: 'machine_intro/manuals' } }],
			},
		],
	},
	{
		label: '写作指南',
		items: [{ autogenerate: { directory: 'guides' } }],
	},
	{
		label: '元素与组件示例',
		items: [{ autogenerate: { directory: 'examples' } }],
	},
	{
		label: '参考手册',
		items: [{ autogenerate: { directory: 'reference' } }],
	},
];

export default sidebar;
