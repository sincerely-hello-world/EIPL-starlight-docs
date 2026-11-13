---
title: 实验室 1 号机｜普通用户使用手册
description: EIPL 实验室 1 号机的普通用户登录、数据存放与环境使用说明。
slug: machine_intro/manuals/eipl01
sidebar:
  label: 1 号机使用手册
  order: 1
---

更新：2026-10-22。适用于管理员已创建账号及个人数据目录的新成员。

## 1. 首次登录与修改密码

向管理员领取自己的用户名。在个人电脑打开 PowerShell（Windows）或终端（macOS/Linux），将下面的 `yourname` 换成自己的用户名：

```bash
ssh -p 42222 yourname@47.101.138.102
```

初次连接会提示核对服务器指纹，请向管理员确认后输入完整的 `yes`。出现 password 提示时输入自己的账号密码，输入时不显示字符或星号，输入完成按回车。

**后续新账号约定的初始密码为 `联系管理员获取`。首次登录后立即执行以下命令，改成自己的独立密码：**

```bash
passwd
```

先输入当前密码 `联系管理员获取`，再输入两遍新密码。新密码需符合系统要求；以修改成功提示为准。旧账号的密码不会因为本手册自动改变，忘记密码请联系管理员重置。默认密码修改目前由本人完成，并非已设置自动强制修改。

看到服务器终端提示符后，后续命令均在服务器中运行。普通用户不需要管理员密码，也不需要 sudo。退出远程连接用 `exit`。

## 2. 文件应该放在哪里

| 入口 | 用途 |
|---|---|
| `~` 或 `/home/yourname` | 个人家目录，适合配置文件和小型代码 |
| `~/data` | 个人数据盘入口，实际指向 `/data/users/yourname` |
| `~/data/projects` | 项目代码 |
| `~/data/datasets` | 数据集 |
| `~/data/models`、`~/data/runs` | 模型和训练输出 |

首次使用可创建以下目录：

```bash
ls -ld ~/data
readlink -f ~/data
df -h ~/data
mkdir -p ~/data/{projects,datasets,models,runs}
```

正常情况下，数据路径应解析为 `/data/users/自己的用户名`。若入口不存在或提示没有权限，请先联系管理员。不要自行删除或替换 `data` 软链接。

只有写到 `~/data` 下的文件才使用数据盘；家目录下其他文件不会自动转移。个人目录对其他普通成员隔离，管理员可维护。未设置每人固定容量配额，目录隔离不等于分配独立磁盘空间，也不等于自动备份。

## 3. 使用现成的公共 PyTorch

1 号机提供可直接使用的公共深度学习环境，无需重复安装 Miniconda 和 PyTorch：

| 项目 | 版本或配置 |
|---|---|
| GPU | RTX 3080，10GB 显存 |
| Python | 3.12.15 |
| PyTorch | 2.9.1+cu126 |
| torchvision / torchaudio | 0.24.1+cu126 / 2.9.1+cu126 |
| CUDA 运行库 | 12.6 |

在 Bash 终端运行；如果 `source` 提示不存在，先输入 `bash`：

```bash
source /home/lab-shared/activate-pytorch.sh
python --version
python -c "import torch; print(torch.__version__); print('CUDA:', torch.cuda.is_available()); print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

正常应看到 CUDA 为 `True` 和 RTX 3080。每次打开新的终端都需要激活所需环境。

公共环境由管理员维护，普通用户可以运行但不能修改。不要向公共环境安装或升级包，也不要用 `pip install --user` 绕过限制；有不同依赖需求时使用个人环境。

## 4. 项目需要额外依赖时

可以复制公共环境到自己的数据目录，保留现有 PyTorch 版本后自行安装依赖。复制会额外占用空间，仅在确有需要时使用。`myproject` 应换成尚未使用的项目名：

```bash
source /home/lab-shared/miniconda3/etc/profile.d/conda.sh
mkdir -p ~/data/envs ~/.conda/pkgs
CONDA_PKGS_DIRS="$HOME/.conda/pkgs" conda create --copy -p "$HOME/data/envs/myproject" --clone /home/lab-shared/envs/pytorch-2.9.1-py312
conda activate "$HOME/data/envs/myproject"
python -m pip install -r requirements.txt
```

最后一条需在含有项目 `requirements.txt` 的目录执行；没有该文件就跳过。依赖安装可能改变原有 PyTorch 版本，安装后重新检查 CUDA。退出当前环境用 `conda deactivate`。

## 5. VS Code 远程开发

在个人电脑的 VS Code 安装 Remote - SSH，通过“连接到主机”添加：

```text
ssh -p 42222 yourname@47.101.138.102
```

输入修改后的个人密码，选择 Linux，打开 `/home/yourname/data/projects/你的项目`。在远程端安装 Python 扩展，通过“Python: Select Interpreter”选择解释器：

- 公共环境：`/home/lab-shared/envs/pytorch-2.9.1-py312/bin/python`
- 个人环境：`/home/yourname/data/envs/myproject/bin/python`

选择解释器和终端激活环境是两个步骤；终端训练前仍应确认已激活正确环境。

## 6. 上传文件与运行训练

在个人电脑终端上传文件，注意 `scp` 的端口参数是大写 `-P`：

```bash
scp -P 42222 ./example.zip yourname@47.101.138.102:~/data/
```

也可用支持 SFTP 的图形客户端，填写同样的地址、端口、用户名和个人密码。

训练前在服务器执行 `nvidia-smi` 查看显存和其他任务，与正在使用 GPU 的成员协调。公共环境并不意味着每人有独立 GPU。

对于已有 `train.py` 的项目，可使用 tmux 保持任务运行：

```bash
tmux new -s train
source /home/lab-shared/activate-pytorch.sh
cd ~/data/projects/你的项目
python train.py > train.log 2>&1
```

按 `Ctrl+B` 后松开，再按 `D`，即可离开会话而不停止任务。重新登录后执行 `tmux attach -t train` 返回。查看日志用 `tail -f train.log`；`Ctrl+C` 停止日志查看。如果直接在训练前台按 `Ctrl+C`，则会停止自己的训练。

项目的数据、下载缓存和模型输出路径也应指向自己的 `~/data`。不要修改系统软件、驱动或结束他人的进程。

## 7. 常见情况

- **Permission denied (publickey)**：可尝试 `ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password -p 42222 yourname@47.101.138.102`。仍失败时将完整报错发给管理员，不要发送密码。
- **忘记密码**：联系管理员重置；使用的是自己的 Linux 账号密码。
- **conda 或 source 不存在**：先运行 `bash`，再执行上面的初始化或激活命令。
- **CUDA out of memory**：减少 batch size，确认其他任务占用，与成员协调后再运行。
- **公共环境 Permission denied**：使用个人环境，或请管理员统一增加依赖。
- **数据盘空间**：`df -h ~/data` 查看整盘空间，`du -sh ~/data/*` 查看自己的文件占用。

该公共环境已以普通用户身份完成 MNIST GPU 训练和模型保存、加载验证，两轮测试准确率约 98.73%。具体项目仍需按自身依赖和显存需求验证。
