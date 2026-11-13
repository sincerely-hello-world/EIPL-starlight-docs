---
title: 实验室 3 号机普通用户使用手册
description: EIPL 实验室 3 号机的普通用户登录、数据存放与环境使用说明。
slug: machine_intro/manuals/eipl03
sidebar:
  label: 3 号机使用手册
  order: 3
---

更新于 2026-11-07。适用于管理员已经开通账号的实验室成员。

## 1. 登录

在自己电脑的 PowerShell 或终端中运行以下命令，把 yourname 换成分配给你的用户名。

~~~bash
ssh -p 32222 yourname@47.101.138.102
~~~

首次连接请向管理员核对主机指纹。如果账号使用密码登录，请输入个人账号的初始密码。终端输入密码时不会显示字符。首次登录后可在服务器上运行 passwd 修改密码。若管理员为你配置了个人 SSH 公钥，则用与该公钥配对的私钥登录。

使用 VS Code 时，安装 Remote - SSH 扩展，在「Connect to Host」中输入上面的 SSH 命令。连上后选择 Linux，并打开自己的项目目录，例如 /home/yourname/data/projects/myproject。

## 2. 存放项目和数据

| 路径 | 用途 |
|---|---|
| ~ 或 /home/yourname | 家目录，放配置和小型文件 |
| ~/data | 个人数据盘入口，实际指向 /data/personal/yourname |
| ~/data/projects | 项目代码 |
| ~/data/datasets、~/data/runs | 数据集、模型和训练结果 |

先检查入口和挂载，再建立项目目录。

~~~bash
readlink -f ~/data
findmnt --mountpoint /data
df -h ~/data
mkdir -p ~/data/{projects,datasets,runs}
~~~

若 ~/data 不存在、解析到其他位置，或 /data 未挂载，请联系管理员。上传文件可在自己的电脑上执行：

~~~bash
scp -P 32222 ./train.py yourname@47.101.138.102:~/data/projects/
~~~

## 3. 启用公共 Python 和 PyTorch

在服务器的 Bash 中执行：

~~~bash
source /opt/miniconda3/activate-pytorch.sh
python --version
python -c 'import torch; print(torch.__version__); print([torch.cuda.get_device_name(i) for i in range(torch.cuda.device_count())])'
~~~

公共环境提供 Python 3.12.15、PyTorch 2.9.1+cu126、torchvision 0.24.1+cu126 和 torchaudio 2.9.1+cu126。每次新开终端后重新激活。VS Code 用「Python: Select Interpreter」选择：

~~~text
/opt/miniconda3/envs/pytorch-2.9.1-py312/bin/python
~~~

公共环境由管理员维护。如果项目需要额外依赖，可在个人数据盘创建独立环境。将 myproject 改成自己的项目名。

~~~bash
source /opt/miniconda3/etc/profile.d/conda.sh
conda create --copy -p "$HOME/data/envs/myproject" python=3.12 pip
conda activate "$HOME/data/envs/myproject"
python -m pip install -r requirements.txt
~~~

最后一条在项目目录内执行。若项目有自己的 PyTorch 版本要求，按项目说明安装。

## 4. 选卡和运行训练

两张显卡共用公共环境，各有 8 GiB 显存。先用 nvidia-smi 查看占用，再和其他成员协调选卡。下面以第 0 张卡为例，使用 GPU UUID 锁定对应设备：

~~~bash
nvidia-smi
cd ~/data/projects/myproject
source /opt/miniconda3/activate-pytorch.sh
CUDA_VISIBLE_DEVICES="$(nvidia-smi -i 0 --query-gpu=uuid --format=csv,noheader)" python train.py
~~~

要用第 1 张卡，把 -i 0 改成 -i 1。进程只看到一张卡时，PyTorch 中这张卡的编号是 cuda:0。需要断开 SSH 后继续运行任务，可以先用 tmux new -s train 建立会话，在里面运行训练，按 Ctrl+B 再按 D 离开。再次登录后用 tmux attach -t train 回到会话。

## 5. 常见问题

- 登录失败时，先确认端口是 32222、账号是自己的用户名。如果提示 Permission denied，请把完整报错发给管理员。
- 找不到 torch 或 Python 版本不符时，重新运行激活命令，用 command -v python 确认解释器路径。
- 遇到 CUDA out of memory 时，用 nvidia-smi 查看占用，选择空闲显卡或减小 batch size。
