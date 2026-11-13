---
title: 实验室 5 号机｜普通用户使用手册
description: EIPL 实验室 5 号机的普通用户登录、数据存放与环境使用说明。
slug: machine_intro/manuals/eipl05
sidebar:
  label: 5 号机使用手册
  order: 5
---

更新：2026-10-22。适用于管理员已创建账号、加入 conda 组并配置个人数据目录的新成员。

## 1. 首次登录与修改密码

在个人电脑打开 PowerShell（Windows）或终端（macOS/Linux），将 `yourname` 替换为管理员分配的用户名：

```bash
ssh -p 52222 yourname@47.101.138.102
```

初次连接时向管理员核对服务器指纹，确认后输入完整的 `yes`。看到 password 提示后输入个人账号密码，输入时不显示字符或星号，按回车提交。

**后续新账号约定的初始密码为 `联系负责人获取`。首次登录后立即修改：**

```bash
passwd
```

依次输入当前密码 `联系负责人获取`、自己的新密码、再次输入新密码。以修改成功提示为准。旧账号密码不会因本手册自动改变；忘记密码请联系管理员重置。目前由成员主动修改，并非已设置自动强制修改。

普通成员使用自己的 Linux 密码，不需要管理员或面板密码。看到服务器终端提示符后，以下命令均在服务器中执行。退出用 `exit`。

## 2. 个人文件与数据盘

| 入口 | 用途 |
|---|---|
| `~` 或 `/home/yourname` | SSD 上的个人家目录，适合配置及代码 |
| `~/data` | 指向 `/data/personal/yourname` 的个人数据盘入口 |
| `~/.conda/envs` | 个人 Conda 环境默认位置 |
| `~/.conda/pkgs` | 个人软件包缓存 |

首次登录检查并建立常用目录：

```bash
ls -ld ~/data
readlink -f ~/data
df -h ~/data
mkdir -p ~/data/{projects,datasets,models,runs}
```

数据路径应解析为 `/data/personal/自己的用户名`。若不存在或无法访问，请联系管理员，不要删除或替换软链接。大数据集、模型和训练结果放在 `~/data` 下；其他位置的文件不会自动转移。

个人数据目录对其他普通成员隔离，管理员仍可维护。未设置个人容量配额，大家共享整盘剩余空间；数据盘不等于自动备份。

## 3. 公共 Conda 与个人环境

5 号机提供公共 Miniconda（conda 26.9.3），位置为 `/opt/miniconda3`。普通成员可以使用，不能修改公共程序、base、共享环境或公共缓存。

GPU 为 RTX 3090，24GB 显存。管理员已安装只读公共深度学习环境：

| 项目 | 版本或路径 |
|---|---|
| 公共环境 | `/opt/miniconda3/envs/pytorch-py310` |
| Python | 3.10.22 |
| PyTorch | 2.9.1+cu126 |
| torchvision | 0.24.1+cu126 |
| torchaudio | 2.9.1+cu126 |
| 激活脚本 | `/opt/miniconda3/activate-pytorch-py310.sh` |

该环境由管理员维护，成员可以读取和运行，不能安装、升级或删除其中的软件包。

在服务器 Bash 中运行（若 `source` 不存在，先执行 `bash`）：

```bash
source /opt/miniconda3/etc/profile.d/conda.sh
conda --version
conda env list
```

使用公共 PyTorch：

```bash
source /opt/miniconda3/activate-pytorch-py310.sh
python -c "import torch; print(torch.__version__); print('CUDA:', torch.cuda.is_available()); print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

每个新终端都可这样初始化。若希望自动初始化 Bash，可执行一次 `conda init bash`，然后重新登录。

创建独立环境，`myproject` 换成自己的项目名：

```bash
conda create -n myproject python=3.10 pip
conda activate myproject
python --version
```

默认环境位于 `~/.conda/envs/myproject`。下面的 PyTorch 组合已在本机普通用户的独立验证环境中通过 GPU 训练测试，可作为项目起点；不是所有项目的通用依赖保证：

```bash
python -m pip install torch==2.9.1 torchvision==0.24.1 torchaudio==2.9.1 \
  --index-url https://mirror.sjtu.edu.cn/pytorch-wheels/cu126/ \
  --extra-index-url https://pypi.tuna.tsinghua.edu.cn/simple
python -c "import torch; print(torch.__version__); print('CUDA:', torch.cuda.is_available()); print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

正常应显示 CUDA 为 `True` 和 RTX 3090。环境创建和依赖下载需要联网；提示确认或服务条款时阅读后自行处理。无需另装 GPU 驱动。

安装其他依赖应在自己的环境中执行，例如 `python -m pip install -r requirements.txt`，并确认当前目录存在该文件。不要使用 `sudo pip install`，也不要向公共 base 安装包。退出环境用 `conda deactivate`。

若需要把新环境放在数据盘，可用下面的方式代替前面的创建步骤；不要对同一项目重复创建两套环境：

```bash
mkdir -p ~/data/envs
conda create -p "$HOME/data/envs/myproject" python=3.10 pip
conda activate "$HOME/data/envs/myproject"
```

数据盘为机械盘，环境加载可能比 SSD 慢；家目录中的下载缓存也不会随环境自动迁移。

## 4. VS Code 远程开发

在个人电脑 VS Code 中安装 Remote - SSH，添加并连接：

```text
ssh -p 52222 yourname@47.101.138.102
```

输入个人密码，选择 Linux，打开 `/home/yourname/data/projects/你的项目`。在远程端安装 Python 扩展，用“Python: Select Interpreter”选择自己的解释器：

- 默认个人环境：`/home/yourname/.conda/envs/myproject/bin/python`
- 数据盘个人环境：`/home/yourname/data/envs/myproject/bin/python`

可以直接选择公共 PyTorch 解释器：

```text
/opt/miniconda3/envs/pytorch-py310/bin/python
```

需要个人依赖的项目请选择自己的环境。终端中仍需初始化 Conda 并激活相应环境。

## 5. 上传文件与训练

在个人电脑终端上传，注意端口参数为大写 `-P`：

```bash
scp -P 52222 ./example.zip yourname@47.101.138.102:~/data/
```

也可使用 SFTP 图形客户端，填写相同的主机、端口、用户名和个人密码。

训练前运行 `nvidia-smi` 查看显存与任务占用，并与其他成员协调。共享服务器没有为每个用户单独分配 GPU。

已有 `train.py` 的项目可这样运行：

```bash
source /opt/miniconda3/etc/profile.d/conda.sh
conda activate myproject
cd ~/data/projects/你的项目
python train.py
```

此方式用于交互调试，SSH 断开可能影响任务。需要后台运行并记录日志时，可改用：

```bash
nohup python -u train.py > train.log 2>&1 < /dev/null &
echo $!
```

记下返回的进程号，用 `tail -f train.log` 查看日志；此时 `Ctrl+C` 只退出日志查看。停止自己的任务可执行 `kill 进程号`，先确认它确实是本次任务，不能结束其他成员的进程。

让项目的数据、模型和结果输出写入自己的 `~/data`。个人账号无需 sudo，也不要自行修改系统、驱动或公共环境。

## 6. 常见情况

- **Permission denied (publickey)**：尝试 `ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password -p 52222 yourname@47.101.138.102`。仍失败请联系管理员检查账户和 SSH 策略，不要发送密码。
- **忘记密码**：请管理员重置个人 Linux 密码。
- **公共 Conda 无法访问**：执行 `id`，将结果交给管理员检查 conda 组成员资格；加入组后通常需要重新登录。
- **import torch 失败**：确认已运行 `source /opt/miniconda3/activate-pytorch-py310.sh`，并检查 `which python` 是否指向 `/opt/miniconda3/envs/pytorch-py310/bin/python`。
- **CUDA out of memory**：减少 batch size，与其他使用者协调显存。
- **磁盘空间**：`df -h ~/data` 查看整盘空间，`du -sh ~/data/*` 查看自己的占用。

本机已以普通账号 `test` 使用公共环境完成 GPU 小型训练，验证了 CUDA、前向计算、反向传播、参数更新、模型保存和重新加载。结果为 Python 3.10.22、PyTorch 2.9.1+cu126、RTX 3090，训练损失由 2.323845 降至 1.893185。模型测试文件位于 `/home/test/data/public-pytorch-check.pt`。具体科研项目仍需按自身依赖和显存需求验证。
