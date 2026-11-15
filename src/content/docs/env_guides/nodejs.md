---
title: Node.js 与 pnpm 包管理
description: 使用 mise 准备 Node.js 环境，通过 pnpm 开发项目和管理依赖。
sidebar:
  label: Node.js 与 pnpm
  order: 2
---
Node.js 用于运行 JavaScript，pnpm 用于安装依赖和执行项目命令，mise 用于管理它们的版本。

## 1. 安装 mise

Linux / macOS 使用官方安装脚本：

```sh
curl -fsSL https://mise.run | sh
```

安装后还需激活终端环境，具体步骤见 [mise 使用指南](../mise/#1-安装-mise)。完成后检查：

```sh
mise --version
```

## 2. 准备或复现环境

新项目中，使用 `mise use` 安装工具并写入 `mise.toml`：

```sh
mise use node@26 pnpm@latest
```

已有 `mise.toml` 的项目，进入项目根目录，查看配置后直接安装：

```sh
mise trust
mise install
```

确认工具可用：

```sh
# source ~/.bashrc
node --version
pnpm --version
```

## 3. 开发与包管理

在项目根目录安装依赖：

```sh
pnpm install
```

本仓库使用以下命令启动开发、查看状态、停止服务和构建：

```sh
pnpm astro dev --background
pnpm astro dev status
pnpm astro dev stop
pnpm build
```

其他项目的启动、构建命令以 `package.json` 中的 `scripts` 为准。

### 项目文件说明

| 文件或目录         | 作用                                                        | 是否提交到 Git |
| ------------------ | ----------------------------------------------------------- | -------------- |
| `mise.toml`      | mise 工具版本配置，由 `mise use` 写入或手动维护           | 是             |
| `package.json`   | 项目依赖、脚本和包管理器版本声明，可通过 `pnpm init` 创建 | 是             |
| `pnpm-lock.yaml` | pnpm 安装依赖时生成的锁文件，记录具体依赖版本               | 是             |
| `node_modules/`  | pnpm 安装的本地依赖目录                                     | 否             |

修改依赖后，将 `package.json` 和 `pnpm-lock.yaml` 一起提交。获取他人的更新后，执行 `pnpm install` 同步本地依赖。本仓库统一使用 pnpm。

### npm 与 pnpm 常用命令

将下表中的 `包名` 替换为实际名称。`update` 默认在声明的版本范围内更新；`build` 执行项目定义的构建脚本。更多说明见 [npm 文档](https://docs.npmjs.com/) 和 [pnpm 文档](https://pnpm.io/)。

| 操作               | npm                     | pnpm                    |
| ------------------ | ----------------------- | ----------------------- |
| 增：添加依赖       | `npm install 包名`    | `pnpm add 包名`       |
| 增：添加开发依赖   | `npm install -D 包名` | `pnpm add -D 包名`    |
| 删：移除依赖       | `npm uninstall 包名`  | `pnpm remove 包名`    |
| 查：查看直接依赖   | `npm list --depth 0`  | `pnpm list --depth 0` |
| 改：更新依赖       | `npm update 包名`     | `pnpm update 包名`    |
| 同步：安装项目依赖 | `npm install`         | `pnpm install`        |
| 构建项目           | `npm run build`       | `pnpm run build`      |
