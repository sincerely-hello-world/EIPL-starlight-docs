# EmDash 文档集成与本地验收

## 当前结构

EmDash 的 Posts、Pages 已发布内容在 Starlight 侧边栏自动归入顶层 **emdash文档**，统一放在所有静态文档分组之后。Markdown/MDX 仍由仓库管理；CMS 内容保存在 SQLite，不会写成 Markdown 文件。

```text
文档首页
实验室服务器
astro静态文档使用参考

emdash文档
  文档总览
  new
  其他已发布内容…
```

| 文件 | 职责 |
| --- | --- |
| `config/EmDash.mjs` | EmDash、React、SQLite、媒体、预打包修复、公开路由与 CMS 模式的 Starlight 选项；默认内容类型为 posts、pages |
| `config/sidebar.mjs` | 仓库文档导航，以及 `emdashSection` 的名称、位置和 URL 前缀 |
| `astro.config.mjs` | 公共文档配置工厂与默认静态构建 |
| `astro.config.cms.mjs` | 合并公共配置与 EmDash 模块的入口 |
| `src/live.config.ts` | CMS 模式注册 `_emdash` live collection；静态模式不导入 EmDash 运行时 |
| `src/cms/documents.ts` | 分页查询所有已发布文档；只在同一个请求内复用查询结果 |
| `src/cms/sidebar.ts` | Starlight routeMiddleware，插入实时分组、当前项高亮及 CMS 文档前后页链接 |
| `src/cms/middleware.ts` | 对带实时导航的公开 HTML 使用 `Cache-Control: no-store` |
| `src/cms/pages/` | 文档总览、详情与旧地址跳转；统一使用 Starlight 布局 |
| `src/layouts/DocumentLayout.astro` | 直接复用官方 StarlightPage，作为 CMS 文档的主题布局入口，无自定义 CSS |
| `src/components/content/` | 通用内容格式转换及官方 Code、Aside、AnchorHeading 组件绑定，无独立主题样式 |

## 本地运行

项目 mise 声明 Node 26，依赖版本由 `pnpm-lock.yaml` 固定。

```powershell
pnpm install
pnpm run dev:cms
pnpm run cms:status
pnpm run cms:logs
pnpm run cms:stop
```

- 后台：<http://localhost:4322/_emdash/admin/>
- 文档首页：<http://localhost:4322/>
- CMS 文档总览：<http://localhost:4322/emdash/>
- 现有测试文档：<http://localhost:4322/emdash/posts/new/>

Astro 按项目根目录管理后台服务锁，两套配置应轮流运行。若提示已有服务，先确认并停止原服务，再启动 CMS。修改配置模块后需重启；后台发布内容不需重启。

SQLite 为 `data.db`，媒体目录为 `uploads/`，加密密钥保存在 `.env`，均已排除在 Git 外。已有密钥不要重新生成；请安全备份密钥和数据库。停止服务器不会删除数据。

全新环境尚无密钥时执行一次：

```powershell
pnpm exec emdash secrets generate --write .env
```

## 发布与导航

1. 首次访问后台，填写站点信息、创建管理员并注册 Passkey。账号由使用者自行设置。
2. 在 Posts 或 Pages 中新建内容，保存草稿，再点击 Publish。
3. 刷新首页或任意文档页；内容会出现在“emdash文档”下，无需手动编辑 sidebar、选择分类或搬移内容。
4. 点击标题，在 Starlight 正文区域阅读；侧边栏当前项高亮，分组展开。
5. 修改标题或正文并重新发布后，下一次请求读取新的已发布版本。只保存草稿时公开页面继续显示上一份已发布内容。
6. 取消发布、归档或删除后，下一次公开请求不再将其列入导航；无可见内容的详情返回 HTTP 404。

导航按内容类型配置顺序排列，同类型按创建时间升序查询。查询遍历所有分页，不只显示前 100 条。链接使用 EmDash 返回的 `entry.id`，保留其可能包含的语言前缀。

| 地址 | 行为 |
| --- | --- |
| `/emdash/` | 所有已发布 CMS 文档的总览 |
| `/emdash/posts/[...slug]/` | Posts 文档 |
| `/emdash/pages/[...slug]/` | Pages 文档，避免与 Posts 同名 slug 冲突 |
| `/posts`、`/posts/` | 301 跳转文档总览 |
| `/posts/[...slug]` | 301 跳转对应的新 Posts 文档地址，保留查询参数 |

“emdash文档”是前台导航目录，不是数据库中的文件夹；无需重建现有集合。新增其他内容类型后，可在 `config/EmDash.mjs` 的 `contentTypes` 中明确纳入导航和公开路由。

发布写入数据库，不触发 Astro 源码 HMR。页面按请求查询内容，已打开的浏览器标签页仍需刷新。CMS 模式下 Starlight 显式设置 `prerender: false`，确保原仓库文档页面的侧边栏也能更新。

## Markdown 粘贴与 Starlight 正文样式

EmDash 原生保存 Portable Text。直接复制 Markdown 源码到富文本编辑器时，可能只转换行内加粗、链接等，标题、代码围栏和 `:::tip` 仍保存为普通段落。仅加载主题 CSS 无法将这些文本转换成对应 HTML。

公开详情页现已识别这种整篇粘贴形式：所有块都是普通段落且包含明显的 Markdown 结构时，在读取阶段重建 Markdown 并用 Sätteri 解析。代码块复用 Starlight 的 `Code`（Expressive Code），提示框复用 `Aside`，标题复用 `AnchorHeading`，生成右侧目录；表格、列表、引用等沿用 `.sl-markdown-content` 默认排版。普通富文本仍使用 PortableText，其代码块也改用 Starlight Code。

该兼容不会改写数据库或后台编辑器。已包含真正富文本标题、列表、图片或自定义块的内容不会整体重解释为 Markdown。它也不执行 MDX/JavaScript；HTML 清理后才输出，安全的 details/summary 可保留。测试命令：`node --test scripts/cms-markdown.test.mjs`。

CMS 总览和详情统一通过 `src/layouts/DocumentLayout.astro` 直接引用官方 `StarlightPage`，因此与 `src/content/docs` 共用 Starlight 提供的正文容器、默认 CSS 和主题配置。`src/cms` 只保留数据查询、路由及导航接入；Markdown 兼容和代码块数据绑定放在 `src/components/content`，不编写 `<style>` 或 CMS 专属 CSS，也不复制主题样式。

Starlight 配色、字体等站点主题设置会同时作用于两类内容。更换完全不同的主题框架时，仍需调整文档布局及该框架专有组件的绑定；Astro 没有任意主题之间通用的页面组件接口。保留 Markdown 格式转换只是为了兼容已有粘贴内容，不会改写 CMS 文档或模拟主题 CSS。

复制时已经丢失的空行等原始排版无法精确还原。复制自仓库文档的相对链接与 `src/assets` 文件路径不会自动迁移：应替换成有效站内地址，图片通过媒体库上传后引用。

## 搜索与静态部署边界

CMS 模式暂时关闭 Pagefind：构建时搜索索引不能自动跟随数据库发布更新。动态内容全文搜索需要另行接入。

默认 `pnpm run build` 仍生成静态文档、Pagefind 索引和 `dist-cloudflare/`。静态产物不含 CMS 后台、数据库文档及实时侧边栏，可继续用于原 GitHub Pages / 静态 Worker 流程。

本地服务端构建验证命令为：

```powershell
pnpm astro build --config astro.config.cms.mjs
```

输出为 `dist-cms/`。现有 `wrangler.jsonc` 和 `prepare-cloudflare.mjs` 只适用于静态部署，不能部署这份 CMS 服务端产物。

## 验证记录与已处理问题

2026-11-14：EmDash 1.5.0、Node 适配器 11.1.12、React 集成 7.1.8、React/React DOM 19.3.1；代理执行环境 Node 24.15.0，仓库 Node 26 配置未改动。

- 已验证首页、原组件文档、CMS 总览与 `/emdash/posts/new/` 均返回 200，并包含 CMS 导航链接。
- 已验证缺失的 Pages 文档返回 404，旧 `/posts/new` 地址跳转到新详情地址。
- 浏览器中核对了顶层分组、Starlight 正文布局、当前项高亮，以及从首页侧边栏打开文档。
- 默认静态构建通过，生成 11 页与 Pagefind；CMS 服务端构建也通过。
- CMS 服务端构建中 Google 字体源网络访问失败产生警告，未阻止构建。静态构建另有大分块、空 i18n 和未设置 site 的提示。
- 未替使用者修改文章、注册 Passkey 或创建远程 Cloudflare 资源。新内容发布/取消发布流程可由使用者进一步验收。

已处理：EmDash 后台/API 路径不兼容强制尾斜杠，CMS 单独使用 `trailingSlash: 'ignore'`；静态构建隔离 EmDash 虚拟模块；后台 React 挂载缺少 `createRoot` 导出时，通过 `vite.optimizeDeps.include: ['react-dom/client']` 修复。

## 后续 Cloudflare 方案（等待确认）

建议先使用独立测试 Worker，切换至 Cloudflare 适配器和 `@emdash-cms/cloudflare`，不与 Node 适配器同时启用。D1 `DB` 存储内容/用户/设置，R2 `MEDIA` 存储媒体，Static Assets 提供前端资源；会话、定时任务、图片变换按实际功能配置。首轮不启用沙箱插件。

本地 SQLite/uploads 不会自动同步到 D1/R2。后续需审阅导入迁移、生产密钥、登录域名、备份与回滚、协作编辑和实际账号产品可用性。GitHub Pages 无法承载 CMS 服务端路由。

## 官方依据

- [EmDash for Astro Developers](https://docs.emdashcms.com/coming-from/astro/)
- [Astro EmDash 集成](https://docs.astro.build/zh-cn/guides/cms/emdash/)
- [Starlight 自定义页面](https://starlight.astro.build/guides/pages/#custom-pages)
- [Starlight 路由数据](https://starlight.astro.build/guides/route-data/)
- [Starlight SSR](https://starlight.astro.build/manual-setup/#use-starlight-with-ssr)
- [Cloudflare 产品与绑定](https://developers.cloudflare.com/workers/framework-guides/web-apps/emdash/#cloudflare-products-emdash-uses)
