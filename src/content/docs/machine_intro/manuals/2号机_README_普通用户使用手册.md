---
title: eipl02 服务器普通用户使用手册
description: EIPL 实验室 2 号机的普通用户登录、数据存放与环境使用说明。
slug: machine_intro/manuals/eipl02
sidebar:
  label: 2 号机使用手册
  order: 2
---

## eipl02 服务器 SSH 配置说明（个人用户）
### 全部用户信息列表

| 用户名 | 用户全称 | 类型 | 所属组 |
|--------|----------|------|--------|
| dyuhang | 丁宇航 | 个人用户 | dyuhang,users |
| eipl02 | EIPL02管理员 | 管理员 | eipl02,adm,cdrom,sudo,dip,plugdev,users,lpadmin,depression |
| gdeyang | 高德阳 | 个人用户 | gdeyang,users |
| jqianming | 嵇前铭 | 个人用户 | jqianming,users,depression |
| liulu | 刘璐 | 个人用户 | liulu,users |
| lweijie | 刘玮杰 | 个人用户 | lweijie,users |
| lzheran | 李哲然 | 个人用户 | lzheran,users |
| normal1 | 普通用户1 | 个人用户 | normal1,users |
| normal2 | 普通用户2 | 个人用户 | normal2,users |
| oyangyao | 欧阳垚 | 个人用户 | oyangyao,users |
| shenyu | 沈宇 | 个人用户 | shenyu,users |
| syingguo | 时应国 | 个人用户 | syingguo,users |
| wjiahe | 王佳贺 | 个人用户 | wjiahe,users |
| xuhang | 徐行 | 个人用户 | xuhang,users,depression |
| ychenyang | 余晨阳 | 个人用户 | ychenyang,users |
| yweihao | 姚卫豪 | 个人用户 | yweihao,users,depression |
| zbowen | 张博闻 | 管理员 | zbowen,sudo,users,depression |
| zjunfeng | 朱峻锋 | 个人用户 | zjunfeng,users,depression |
| zsiqi | 赵思琪 | 个人用户 | zsiqi,users,depression |

### 连接信息

| 项目 | 内容 |
|------|------|
| SSH 连接地址 | `47.101.138.102:22222` |
| 用户名 | 对照上表（小写拼音） |
| 默认密码 | `联系管理员账号负责人获取` |


### 本地配置

在本地 `~/.ssh/config` 中写入如下配置，进行连接测试（默认新建的用户无 sudo 权限，默认密码为 `联系管理员账号负责人获取`，支持 SSH 密码登录）：

```text
Host EIPL02-实验室2号机器-normal1
  HostName 47.101.138.102   # <-- 47.101.138.102 公网 frp 主机 IP
  User normal1              # <-- 用户名，小写的拼音对照上表
  Port 22222                # <-- ssh 端口走 frp 映射到了 22222 端口
```

---

## eipl02 服务器 磁盘储存分配说明（个人用户）

以 `normal1` 这个用户为例，登录后执行：

```bash
cd ~/ && tree -L 1
```

目录结构如下：

```text
.
├── dataset -> /mnt/dataset/dataset/data      # 数据集存放点
├── personal -> /mnt/dataset/personal/normal1 # 个人数据存放点，挂载位置 /mnt/dataset（第二块机械磁盘 4TB，LVM）
├── private -> /mnt/data/private/normal1      # 个人数据存放点，挂载位置 /mnt/data（第一块机械磁盘 2TB，常规挂载）
├── public -> /mnt/data/public/normal1        # 公共个人数据存放点（用户 normal1 子集，建议减少使用）
├── shared -> /mnt/data/public                # 整个公共区（建议减少使用）
└── snap                                      # 删除即可，snap 应用目录
```

> 注：`/` 根目录为系统固态盘 480GB 系统盘，常规挂载。

### 使用建议

用户只需要关注：`~/personal`、`~/private`、`~/dataset` 目录即可。

| 目录 | 用途 | 所在磁盘 |
|------|------|----------|
| `~/personal` | 存放个人代码和数据 | 数据盘1 2TB |
| `~/private` | 存放个人代码和数据 | 数据盘2 4TB |
| `~/dataset` | 大的数据集保存在这里 | 数据盘2 4TB |

1. **（推荐）** 尽量把数据文件存放在 `~/personal`、`~/private`、`~/dataset` 目录下，减少系统盘占用。
   （这两个目录权限为 `chmod 2770`，仅用户自己/自己的同名组，以及 root 可访问）
2. **（减少使用）** `~/public`、`~/shared`
3. **数据集管理：** 整理到 `~/dataset`
   - 建议将大型实验室数据集整理到 `~/dataset`，直接 `mv` 文件到数据集目录即可。
   - 比如要将 `apple/*.json` 移动到 `~/dataset`，直接执行：

     ```bash
     mv apple/*.json ~/dataset/数据集名称/apple
     ```

   - 个人用户可以通过访问 `~/dataset` 来访问数据集；数据集逐渐迁移到 `~/dataset`。
   - 需要注意的是：`~/dataset/数据集名称/apple`，数据集名称需要唯一，仅个人使用建议数据集名称为个人名字拼音。

---

## eipl02 磁盘结构（系统管理员了解）

### 存储概况

| 磁盘 | 容量 | 说明 |
|------|------|------|
| 系统盘 | 480GB | `/` 挂载于该盘（含 `/boot/efi`）；`/home` 为根文件系统下的目录（未单独分区） |
| 数据盘1 | 2TB | 非 LVM，UUID 挂载于 `/mnt/data`，ext4 |
| 数据盘2 | 4TB | LVM 管理（`vg_dataset` → `lv_dataset`），挂载于 `/mnt/dataset`，ext4，启用 `usrquota/grpquota` |
