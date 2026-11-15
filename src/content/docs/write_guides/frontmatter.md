---
title: 页面配置速查
description: 当前项目中常用的 frontmatter、导航配置和发布检查。
sidebar:
  order: 4
  badge:
    text: 网站说明
    variant: tip
---
## Frontmatter 是什么

Frontmatter 是 `.md` / `.mdx` 文件顶部两行 `---` 之间的 YAML 配置，用于设置页面标题、导航和展示方式。它不属于文章正文，也不需要编写 Astro 组件。

下面按 **必需、常用可选、进阶** 分类。进阶属性同样是可选项，不需要每篇文章都填写。当前项目只有 `title` 必填。

## 必需属性

| 属性      | 类型   | 作用                             |
| --------- | ------ | -------------------------------- |
| `title` | 字符串 | 页面标题，也作为默认的侧边栏文字 |

最简页面头部只有一个字段：

```yaml
---
title: 安装指南 # 必需：页面标题
---
```

## 常用可选属性

| 属性                | 省略时的行为                               | 作用                                                   |
| ------------------- | ------------------------------------------ | ------------------------------------------------------ |
| `description`     | 不提供此页面的描述字段                     | 页面摘要，建议填写，供搜索引擎和分享预览使用           |
| `sidebar.label`   | 使用 `title`                             | 自定义侧边栏文字，不改变页面大标题                     |
| `sidebar.order`   | 按文档标识排序，排在设置了排序值的页面之后 | 自动导航中的排序值，数字越小越靠前                     |
| `sidebar.hidden`  | `false`                                  | 设为 `true` 时不出现在自动导航中                     |
| `sidebar.badge`   | 不显示徽章                                 | 在侧边栏菜单文字旁添加小标签                           |
| `tableOfContents` | 使用站点设置                               | 调整页内目录的标题层级，或设为 `false` 隐藏          |
| `draft`           | `false`                                  | 设为 `true` 标记草稿，仅开发模式可见，不进入生产构建 |

### 一份带注释的常用配置

```yaml
---
title: 安装指南 # 必需：页面标题
description: 介绍安装条件、步骤和验证方法。 # 可选，建议：页面摘要
sidebar: # 可选：侧边栏设置
  label: 安装 # 可选：导航短名称，省略时使用 title
  order: 2 # 可选：同组自动导航中，数字越小越靠前
  badge: # 可选：显示在导航文字旁的徽章
    text: 新增 # 使用徽章对象时必需：徽章文字
    variant: tip # 可选：视觉样式，省略时为 default
tableOfContents: # 可选：页内目录
  minHeadingLevel: 2 # 可选：从二级标题开始
  maxHeadingLevel: 3 # 可选：显示到三级标题
draft: false # 可选：false 正常发布，true 为草稿
---
```

复制时按需删除可选项。YAML 使用空格缩进，同一级属性要对齐；正文从结束的 `---` 后开始。

### badge：侧边栏徽章

徽章配置放在 **`sidebar` 内部**，不是顶层的 `badge` 字段：

```yaml
sidebar:
  badge: # 可选：导航徽章
    text: 组件集 # 徽章对象中必需：显示的文字
    variant: tip # 可选：配色样式
```

这会在该页面的侧边栏菜单项旁显示“组件集”，不会修改页面标题，也不会自动在正文中插入徽章。适合标记“新”“实验性”“已弃用”等状态。

| 属性                      | 是否必需       | 说明                                           |
| ------------------------- | -------------- | ---------------------------------------------- |
| `sidebar.badge`         | 可选           | 不写则没有徽章；可直接写字符串，或使用对象配置 |
| `sidebar.badge.text`    | 对象写法时必需 | 徽章内显示的文字                               |
| `sidebar.badge.variant` | 可选           | 内置视觉样式，默认为 `default`               |
| `sidebar.badge.class`   | 进阶，可选     | 自定义 CSS 类名，需要配套样式                  |

| `variant`        | 常见用途           |
| ------------------ | ------------------ |
| `default` 或省略 | 使用站点默认强调色 |
| `note`           | 普通说明           |
| `tip`            | 建议、小贴士       |
| `success`        | 完成、可用状态     |
| `caution`        | 注意、实验性功能   |
| `danger`         | 警告、已弃用功能   |

实际配色取决于主题和明暗模式，`tip` 不应固定理解为绿色。只需要文字和默认配色时，可以简写：

```yaml
sidebar:
  badge: 新 # 可选：等同于 text 为“新”、variant 为 default
```

Frontmatter 中的侧边栏设置适用于自动导航和使用 `slug` 引用的页面；直接在 `sidebar.mjs` 写死的导航属性可覆盖页面设置。独立的导航分组徽章应在 `sidebar.mjs` 对应分组中设置。正文徽章则使用 [MDX Badge 组件](https://starlight.astro.build/components/badges/)。

:::caution[隐藏导航、排除搜索与草稿不同]
`sidebar.hidden: true` 只隐藏自动导航项；`pagefind: false` 只排除站内搜索；页面仍可通过地址访问。`draft: true` 才会将页面排除在生产构建之外。草稿不要通过手动 `slug` 加入生产导航。
:::

## 进阶属性（全部可选）

| 属性                                                      | 用途与示例                                                                  |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| `slug`                                                  | 自定义页面路径；修改后同步检查站内链接和手动导航                            |
| `template`                                              | 默认 `doc`；`splash` 使用不带侧边栏的宽布局，适合首页                   |
| `hero`                                                  | 页面顶部的大标题区域，可设置 `title`、`tagline`、`image`、`actions` |
| `banner.content`                                        | 页面顶部公告内容，支持 HTML                                                 |
| `tableOfContents.minHeadingLevel` / `maxHeadingLevel` | 控制页内目录包含的标题级别                                                  |
| `prev` / `next`                                       | 控制上一篇、下一篇入口；设为 `false` 隐藏，也可自定义文字或链接           |
| `editUrl`                                               | 覆盖此页的编辑链接，或设为 `false` 隐藏                                   |
| `lastUpdated`                                           | 指定更新时间，如 `2026-11-15`，或用布尔值控制显示                         |
| `pagefind`                                              | 默认 `true`；设为 `false` 排除此页的站内搜索索引                        |
| `head`                                                  | 为此页添加 HTML 头部标签，如额外的元信息                                    |
| `sidebar.attrs`                                         | 给侧边栏链接添加 HTML 属性                                                  |
| `sidebar.badge.class`                                   | 为导航徽章附加 CSS 类名                                                     |

例如，隐藏页内目录和前后篇入口，并关闭站内搜索：

```yaml
---
title: 独立说明页 # 必需
tableOfContents: false # 进阶，可选：隐藏页内目录
prev: false # 进阶，可选：隐藏上一篇
next: false # 进阶，可选：隐藏下一篇
pagefind: false # 进阶，可选：不加入站内搜索
---
```

更多字段结构见 [Starlight Frontmatter 完整参考](https://starlight.astro.build/reference/frontmatter/)。

## 站点配置与页面配置

- `astro.config.mjs`：站点标题、语言、集成和社交链接。
- `config/sidebar.mjs`：侧边栏目录分组与自动生成规则。
- `src/content.config.ts`：文档内容集合和 frontmatter 校验规则。
- 文档文件顶部：当前页面的标题、描述和排序。

本项目使用根语言 `zh-CN`，页面直接位于 `src/content/docs/`，不需要再套一层 `zh-cn/` 文件夹：

```js
locales: {
  root: { label: '简体中文', lang: 'zh-CN' },
},
```

## 提交前检查

1. 执行 `pnpm build`，确认没有 frontmatter、MDX 或组件错误。
2. 执行 `pnpm preview`，检查新页面、导航、页内目录和搜索。
3. 检查代码块是否标注了语言，内部链接是否指向存在的页面。
4. 确认公开仓库中没有访问密钥或未准备公开的内容。

## GitHub Pages 自动发布

本项目已配置 `.github/workflows/deploy.yml`。每次推送到 `main`，GitHub Actions 会使用 Node.js 26 与 pnpm 12.18.0 安装锁定的依赖、构建文档，再将构建产物发布到 GitHub Pages。也可以在 Actions 页面使用 **Run workflow** 手动发布。

- 在线地址：[Astro 文档实验室](https://sincerely-hello-world.github.io/EIPL-starlight-docs/)
- 构建记录：[GitHub Actions](https://github.com/sincerely-hello-world/EIPL-starlight-docs/actions/workflows/deploy.yml)
- 首次设置：仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

GitHub Pages 工作流把 `configure-pages` 返回的站点域名和路径分别传入 `SITE_URL`、`BASE_PATH`。普通仓库、用户主页仓库和自定义域名均使用平台实际返回的路径。若构建失败，不会执行发布，已有站点会继续提供服务。

## Cloudflare 的根路径与可选子路径

未绑定自定义域名，Cloudflare 可使用平台提供的默认地址。构建时可以设置：

| 构建环境变量  | 默认值 | 用途                               |
| ------------- | ------ | ---------------------------------- |
| `BASE_PATH` | `/`  | 设为 `/docs` 可发布到 `/docs/` |
| `SITE_URL`  | 未设置 | 换域名时设置成自己的站点地址       |

保持 Build command 为 `pnpm run build`、Deploy command 为 `npx wrangler@latest deploy`。构建脚本根据实际 `BASE_PATH` 生成 `dist-cloudflare/` 的目录结构，完全不使用 `assets.base_path`。使用子路径时，域名根路径会自动跳转到该子路径。

正文和 MDX 的站内 `href` 使用相对页面地址，例如从 `/write_guides/components/` 链接到 `/write_guides/adding-documents/`，写成 `../../write_guides/adding-documents/`。这种写法在根路径、`/docs/` 和 GitHub Pages 仓库路径下都有效。侧边栏的 `slug` 与自动生成的 `directory` 仍使用文档标识。

包名称、仓库名称、Worker 名称和 URL 前缀是不同设置。更改名称不会自动改变 Cloudflare 的访问路径。

## 官方参考

- [Frontmatter 完整参考](https://starlight.astro.build/reference/frontmatter/)
- [Starlight 配置参考](https://starlight.astro.build/reference/configuration/)
- [侧边栏导航](https://starlight.astro.build/guides/sidebar/)
- [语言与根目录配置](https://starlight.astro.build/guides/i18n/)
