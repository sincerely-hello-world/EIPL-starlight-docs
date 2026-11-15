---
title: mise 使用指南
description: 从安装和工具选择开始，使用 mise.toml 复现环境，并通过 task 与 env 管理项目命令和环境变量。
sidebar:
  label: mise 使用指南
  order: 1
---
mise 可以统一管理开发工具版本、项目环境变量和常用任务。将配置写入 `mise.toml` 并随项目提交，其他人就能按同一份配置准备开发环境。

## 1. 安装 mise

### 安装程序

Linux / macOS 可以使用官方安装脚本：

```sh
curl -fsSL https://mise.run | sh
```

默认安装位置是 `~/.local/bin/mise`。安装完成后验证：

```sh
~/.local/bin/mise --version
```

其他安装方式及 Windows 安装步骤见 [mise 官方安装指南](https://mise.jdx.dev/installing-mise.html)。

### 激活终端环境

安装 mise 后，还需要让终端自动加载项目的工具和环境变量。根据使用的 shell，将下面对应的一行添加到配置文件中一次。

```sh
eval "$(~/.local/bin/mise activate bash)"
```

```sh
eval "$(~/.local/bin/mise activate zsh)"
```

如果通过系统包管理器安装，按实际安装路径调整上面的命令；已在 `PATH` 中时可以直接写 `mise activate bash` 或 `mise activate zsh`。

重新打开终端，然后检查：

```sh
mise --version
mise doctor
```

完成激活后，进入不同项目目录，mise 会按项目配置切换工具版本和环境变量。更多 shell 的配置见 [Shell 激活说明](https://mise.jdx.dev/shells.html)。

## 2. 查找工具与选择版本

### mise 支持哪些工具

mise 支持多种语言运行时和命令行工具，例如 Node.js、Python、Go、Java、pnpm 和 uv。可以在终端搜索工具名称：

```sh
mise search
mise search python
mise search node
mise search uv
```

也可以使用交互式搜索：

```sh
mise search --interactive
```

在线工具目录：[mise versions](https://mise-versions.jdx.dev/)。可以在其中搜索工具、查看可用版本及安装标识。

找到工具后，查看它的远程可用版本，例如：

```sh
mise ls-remote node
```

搜索命令的完整说明见 [mise search](https://mise.jdx.dev/cli/search.html)。

### mise use：为项目选择工具

在项目根目录执行：

```sh
mise use node@26
mise use pnpm@latest
```

`mise use` 会安装缺少的工具，并将版本要求写入所选项目配置，通常是 `mise.toml`。如果当前目录及其父目录没有项目配置，则在当前目录创建；已有父级配置时，默认可能写入该配置。需要明确写入当前目录时，可以使用 `mise use --path ./mise.toml node@26`。

在新项目根目录执行上述命令后，配置类似：

```toml
[tools]
node = "26"
pnpm = "latest"
```

启用 shell 集成后，下一次终端提示符刷新时即可使用选中的工具。

### mise use -g：设置个人默认工具

```sh
mise use -g node@26
mise use -g uv@latest
```

`-g` 是 `--global` 的简写，写入个人全局配置，默认位置是 `~/.config/mise/config.toml`。

| 命令                    | 配置范围     | 适用场景                         |
| ----------------------- | ------------ | -------------------------------- |
| `mise use node@26`    | 项目配置     | 为项目记录并共享工具版本         |
| `mise use -g node@26` | 个人全局配置 | 为没有指定版本的项目提供默认工具 |

项目为同一工具指定版本时，项目配置优先于全局默认版本。这里的“全局”是当前用户的默认配置，不会替所有用户修改系统环境。

### 版本范围与固定版本

- `node@26`：选择 26 系列，安装结果可能随可用版本变化。
- `pnpm@latest`：选择最新可用版本，适合跟随更新的工具。
- `mise use --pin node@26`：将解析到的完整版本号写入配置，便于团队统一版本。

需要稳定复现时，优先记录完整版本号；`latest` 或只有主版本号的配置表达的是版本要求，不保证不同时间安装得到完全相同的版本。参数详见 [mise use](https://mise.jdx.dev/cli/use.html)。

## 3. 使用 mise.toml 复现环境

### 将工具配置随项目提交

本仓库根目录的 `mise.toml` 声明了 Node.js 和 pnpm：

```toml
[tools]
node = "26"
pnpm = "latest"
```

其他人获取项目后，在仓库根目录执行：

```sh
# 先查看配置，再信任该项目
mise trust

# 安装配置中声明的工具
mise install
```

`mise install` 按已有配置安装工具，不需要逐个重新执行 `mise use`。项目依赖仍需由对应包管理器安装，例如本仓库还需执行 `pnpm install`。

### 查看生效的工具：mise current

```sh
mise current
mise current node
```

`mise current` 显示当前目录生效的工具及版本。要确认实际运行的版本，也可以执行对应工具的版本命令：

```sh
node --version
pnpm --version
```

### 查看加载的配置：mise config

```sh
mise config
```

`mise config` 列出当前加载的配置文件，方便确认项目配置和个人全局配置是否生效。遇到版本与预期不同的情况，先检查当前目录，再结合 `mise config` 与 `mise current` 定位来源。

### 无需激活 shell 的运行方式

脚本或尚未启用 shell 集成的终端，可以用 `mise exec` 在配置好的环境中执行单条命令：

```sh
mise exec -- node --version
mise exec -- pnpm build
```

`--` 后面是需要运行的命令。工具版本和项目环境变量会应用于该命令。

## 4. mise 进阶：task 与 env

### task：统一项目常用命令

可以在 `mise.toml` 中定义任务，将安装、开发和构建命令统一成容易记忆的入口。以下是可追加到本仓库配置的示例：

```toml
[tasks.setup]
description = "安装项目依赖"
run = "pnpm install"

[tasks.dev]
description = "后台启动文档站"
run = "pnpm astro dev --background"

[tasks.build]
description = "构建文档站"
run = "pnpm build"
```

查看与运行任务：

```sh
mise tasks ls
mise tasks info build
mise run setup
mise run dev
mise run build
```

`mise run` 会加载项目配置中的工具和环境变量，无需事先激活交互式 shell。

如果任务需要前置步骤，可以声明依赖。例如让构建前先完成依赖安装，将上面的 `build` 任务改为：

```toml
[tasks.build]
description = "安装依赖后构建文档站"
depends = ["setup"]
run = "pnpm build"
```

此时 `mise run build` 会等待 `setup` 成功后再构建。如果 `depends` 包含多个任务，这些前置任务可以并行运行，列表顺序不代表执行顺序。更多用法见 [mise Tasks](https://mise.jdx.dev/tasks/)。

### env：为项目设置环境变量

在同一个 `mise.toml` 中添加 `[env]`：

```toml
[env]
EIPL_ENV = "development"
```

启用 shell 集成后，变量会随项目环境加载；通过 `mise exec` 或 `mise run` 运行的命令也能读取它：

```sh
mise exec -- sh -c 'echo "$EIPL_ENV"'
```

也可以从 `.env` 文件加载变量：

```toml
[env]
_.file = ".env"
```

```dotenv
EIPL_ENV=development
```

如果已有 `[env]`，将 `_.file` 合并到同一节中，避免重复声明 TOML 表。含有个人凭据的 `.env` 应加入 `.gitignore`；需要共享变量格式时，可提供不含凭据的 `.env.example`。

查看 mise 为当前配置生成的环境：

```sh
mise env
```

`mise env` 默认输出适合 shell 使用的环境设置语句，仅查看输出不会激活环境；日常终端自动切换仍使用 `mise activate`。输出可能包含配置中的凭据，分享时应留意具体内容。详见 [mise 环境变量指南](https://mise.jdx.dev/environments/)。
