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
		label: 'astro静态文档使用参考',
		items: [{ autogenerate: { directory: 'guides' } }],
	},
];

export default sidebar;
