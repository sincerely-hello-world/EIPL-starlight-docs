---
title: Python 与 uv 环境管理
description: 使用 mise 安装 uv，由 uv 管理 Python、项目环境和依赖。
sidebar:
  label: Python 与 uv
  order: 3
---
**mise 只管理 uv，Python、虚拟环境和依赖都交给 uv。** 以下命令适用于 Linux 的 Bash / Zsh；先完成 [mise 安装与激活](../mise/#1-安装-mise)，并退出已激活的 Conda 环境。

在 Python 项目目录中准备工具：

```sh
mise use uv@latest
```

新建 Python 3.12 项目只需 `uv init --python 3.12`。本机没有合适的 Python 时，uv 会自动下载安装，无需另行配置。详见 [uv 管理 Python](https://docs.astral.sh/uv/guides/install-python/)。

## 1. 环境与包管理

### 环境操作：uv 与 Conda 对照

uv 通常为每个项目创建一个 `.venv/`，使用 `uv run` 运行程序，无需手动激活。

| 操作             | uv                                            | Conda                                           |
| ---------------- | --------------------------------------------- | ----------------------------------------------- |
| 初始化项目       | `uv init --python 3.12`                     | 没有对应的项目初始化命令                        |
| 新建环境         | `uv sync`（在已初始化的项目中）             | `conda create -n demo python=3.12`            |
| 运行程序         | `uv run python main.py`                     | `conda run -n demo python main.py`            |
| 手动激活（可选） | `source .venv/bin/activate`                 | `conda activate demo`                         |
| 删除环境         | 在项目根目录删除 `.venv/`：`rm -rf .venv` | `conda env remove -n demo`                    |
| 首次复现         | `uv sync --locked`                          | `conda env create -f environment.yml`         |
| 同步已有环境     | `uv sync --locked`                          | `conda env update -f environment.yml --prune` |

`uv init` 创建项目配置，`uv sync` 创建 `.venv/` 并安装依赖。删除 `.venv/` 不会删除代码、配置或 uv 安装的 Python。

有 `uv.lock` 时使用 `--locked` 复现；只有 `pyproject.toml` 时先运行 `uv sync` 生成锁文件。详见 [uv 同步说明](https://docs.astral.sh/uv/concepts/projects/sync/) 和 [Conda 环境管理](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html)。

### 包管理：uv、pip 与 Conda 对照

下表以 `pandas` 为例。pip 和 Conda 命令需要在目标环境中运行。

| 操作           | uv 项目管理                          | pip                                           | Conda                                           |
| -------------- | ------------------------------------ | --------------------------------------------- | ----------------------------------------------- |
| 增：安装包     | `uv add pandas`                    | `python -m pip install pandas`              | `conda install pandas`                        |
| 删：移除包     | `uv remove pandas`                 | `python -m pip uninstall pandas`            | `conda remove pandas`                         |
| 查：已安装的包 | `uv pip list`                      | `python -m pip list`                        | `conda list`                                  |
| 查：依赖关系   | `uv tree`                          | `python -m pip show pandas`（包信息）       | `conda list pandas`（包信息）                 |
| 改：更新包     | `uv sync --upgrade-package pandas` | `python -m pip install --upgrade pandas`    | `conda update pandas`                         |
| 同步依赖       | `uv sync --locked`                 | `python -m pip install -r requirements.txt` | `conda env update -f environment.yml --prune` |

uv 的 `add` / `remove` 会同时维护依赖声明、锁文件和项目环境；更新默认受声明的版本范围限制。pip 安装不会自动修改 `requirements.txt`，也不会移除清单之外的包。用法见 [uv 依赖管理](https://docs.astral.sh/uv/concepts/projects/dependencies/) 与 [pip install](https://pip.pypa.io/en/stable/cli/pip_install/)。

### 项目文件说明

| 文件或目录          | 作用                               | 是否提交到 Git |
| ------------------- | ---------------------------------- | -------------- |
| `mise.toml`       | uv 的工具版本                      | 是             |
| `.python-version` | 项目使用的 Python 版本，由 uv 管理 | 是             |
| `pyproject.toml`  | 项目信息、依赖和下载源配置         | 是             |
| `uv.lock`         | uv 生成的具体依赖版本与来源        | 是             |
| `.venv/`          | 本地虚拟环境                       | 否             |

## 例一：从空目录新建项目

### 创建空白环境

```sh
mkdir uv-demo
cd uv-demo
mise use uv@latest
uv init --python 3.12
uv sync
uv run python --version
```

uv 会记录 Python 3.12，创建虚拟环境，可以直接开始添加依赖。

### 配置阿里云镜像

**项目级配置**：在 `pyproject.toml` 中添加：

```toml
[[tool.uv.index]]
name = "aliyun"
url = "https://mirrors.aliyun.com/pypi/simple/"
default = true
```

**个人全局配置**：Linux / macOS 在 `~/.config/uv/uv.toml`（设置了 `XDG_CONFIG_HOME` 时使用对应目录）中添加：

```toml
[[index]]
name = "aliyun"
url = "https://mirrors.aliyun.com/pypi/simple/"
default = true
```

通常配置其中一种即可。项目配置随代码共享，全局配置用于个人默认设置；项目配置优先。注意 `uv.toml` 不写 `tool.uv` 前缀。详见 [uv 配置文件](https://docs.astral.sh/uv/concepts/configuration-files/)。

### 安装 PyTorch：CPU / GPU 二选一

CPU 版本：

```sh
uv add "torch==2.13.0" "torchvision==0.28.0" \
  --index pytorch=https://download.pytorch.org/whl/cpu
```

GPU 版本，以 NVIDIA CUDA 13.2 为例：

```sh
nvidia-smi
uv add "torch==2.13.0" "torchvision==0.28.0" \
  --index pytorch=https://download.pytorch.org/whl/cu132
```

命令会在项目中记录 PyTorch 下载源和包的来源绑定。在生成的 `[[tool.uv.index]]` 中，给 `name = "pytorch"` 的源补上 `explicit = true`，让它只用于显式绑定的包；普通包继续使用阿里云镜像。

本例版本可在官方 [CPU 包索引](https://download.pytorch.org/whl/cpu/torch/) 和 [CUDA 13.2 包索引](https://download.pytorch.org/whl/cu132/torch/) 中查看。GPU 机器需有兼容的 NVIDIA 显卡与驱动；`cu132` 表示 PyTorch 构建使用的 CUDA 版本，不会替你安装驱动。其他 CUDA 版本按 [PyTorch 官方安装说明](https://pytorch.org/get-started/locally/) 选择对应索引。

验证安装：

```sh
uv run python -c "import torch; print(torch.__version__); print(torch.version.cuda); print(torch.cuda.is_available())"
```

CPU 版本的 CUDA 信息为 `None`、可用性为 `False`；GPU 版本只有在显卡和驱动可用时才返回 `True`。

### 日常增删查改

```sh
uv add pandas numpy           # 添加依赖  uv会自动搜寻符合条件的包
uv add --dev pytest           # 添加开发依赖
uv pip list                   # 查看已安装的包版本
uv tree                       # 查看依赖树
uv sync --upgrade-package pandas  # 更新指定包
uv remove pandas              # 删除依赖
uv sync --locked              # 同步锁定的环境
uv run python main.py         # 运行程序
```

## 例二：复现可选 CPU / CUDA 的项目

下面的模板面向 **Linux x86_64、Python 3.12**，通过 `cpu` / `cuda` 两组可选依赖选择 PyTorch 版本。

```toml
[project]
name = "eipl-training-demo"
version = "0.1.0"
description = "CPU or CUDA training environment"
requires-python = ">=3.12,<3.13"
dependencies = [
    "hydra-core>=1.3.5",
    "ipykernel>=7.3.0",
    "lightning>=2.6.5",
    "matplotlib>=3.11.0",
    "numpy>=2.5.1",
    "scikit-learn>=1.9.0",
    "scipy>=1.15.0",
    "tensorboard>=2.21.0",
    "torchmetrics>=1.9.0",
    "visualtorch>=1.4.1",
]

[project.optional-dependencies]
cpu = ["torch==2.13.0", "torchvision==0.28.0"]
cuda = ["torch==2.13.0", "torchvision==0.28.0"]

[tool.uv]
environments = ["sys_platform == 'linux' and platform_machine == 'x86_64'"]
conflicts = [
  [{ extra = "cpu" }, { extra = "cuda" }],
]

[tool.uv.sources]
torch = [
  { index = "pytorch-cpu", extra = "cpu" },
  { index = "pytorch-cu132", extra = "cuda" },
]
torchvision = [
  { index = "pytorch-cpu", extra = "cpu" },
  { index = "pytorch-cu132", extra = "cuda" },
]

# 普通包使用阿里云镜像
[[tool.uv.index]]
name = "aliyun"
url = "https://mirrors.aliyun.com/pypi/simple/"
default = true

# 仅供绑定到该源的包使用
[[tool.uv.index]]
name = "pytorch-cpu"
url = "https://download.pytorch.org/whl/cpu"
explicit = true

[[tool.uv.index]]
name = "pytorch-cu132"
url = "https://download.pytorch.org/whl/cu132"
explicit = true
```

`conflicts` 保证 CPU 和 CUDA 不能同时启用；`sources` 为两组选项分别指定下载源。配置方式见 [uv 的 PyTorch 集成指南](https://docs.astral.sh/uv/guides/integration/pytorch/)。

### 首次生成锁文件

先按例一执行 `uv init --python 3.12`，再用上面的模板替换 `pyproject.toml`，然后执行：

```sh
uv lock
```

提交 `mise.toml`、`.python-version`、`pyproject.toml` 和生成的 `uv.lock`。锁文件记录两组选项，实际同步时只选择一组。

### 获取项目后同步

在项目根目录执行：

```sh
mise trust
mise install
```

按机器选择一条同步命令：

```sh
# CPU 环境
uv sync --locked --extra cpu

# 或：CUDA 13.2 环境
uv sync --locked --extra cuda
```

运行程序时:

```sh
uv run python -c "import torch; print(torch.__version__)"
uv run python -c "import torch; print(torch.cuda.is_available())"
```

切换 CPU / GPU 时，重新执行对应的同步命令即可。

该模板应始终选择一个 extra；`pytorch-lightning` 本身也依赖 torch，不带选项时可能从默认镜像解析到另一种构建。

不要使用 `--all-extras`，也不要在已同步 GPU 环境后执行不带 `--extra cuda` 的普通 `uv run`。

如果修改依赖，先更新声明并运行 `uv lock`，再使用选定 extra 同步；`--locked` 遇到配置与锁文件不一致时会报错。

## 例三：将旧 pip / Conda 项目迁移到 uv

### 已有 requirements.txt

在旧项目目录中初始化 uv（已有 `pyproject.toml` 时跳过 `uv init`）：

```sh
mise use uv@latest
uv init --python 3.12
uv add -r requirements.txt
uv sync --locked
```

如果有开发依赖清单，再执行 `uv add -r requirements-dev.txt`。下载源配置按例一添加；迁移 PyTorch 时按例一或例二明确 CPU / CUDA 来源。导入不会自动保留 requirements 中所有安装选项，详见 [uv 的 pip 项目迁移指南](https://docs.astral.sh/uv/guides/migration/pip-to-project/)。

### 只有旧的 pip / Conda 环境

先在旧环境中导出参考资料，再退出旧环境。下面按实际情况选择一种：

```sh
# 已激活的旧 pip 虚拟环境
python -m pip freeze > requirements-legacy.txt
deactivate
```

```sh
# 已激活的旧 Conda 环境
conda env export > environment-legacy.yml
python -m pip freeze > requirements-legacy.txt
conda deactivate
```

从导出结果中整理项目直接使用的 Python 包，写成 `requirements.txt`，再按上面的导入步骤迁移。删除失效的本地路径、Conda 专用构建记录，并按 Python 3.12 的兼容性调整版本；不要直接把 `conda list --export` 的结果传给 `uv add -r`。

uv 不能直接导入 `environment.yml`，也不会代替 Conda 安装系统库或 CUDA 工具链。Conda 清单中的非 Python 依赖需另行准备；PyTorch 则按前面的专用索引配置。

最后用 `uv run python main.py` 或项目测试命令检查功能，通过后提交 `mise.toml`、`.python-version`、`pyproject.toml` 和 `uv.lock`，将 `.venv/` 加入 `.gitignore`。
