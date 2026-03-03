# LXD-UI

LXD-UI 是 LXD 的浏览器前端。它使容器和虚拟机管理变得简单易用。
适用于小规模和大规模私有云。

**注意：此仓库 (https://github.com/lfhy/incus-ui-cn) 是原项目 https://github.com/zabbly/incus-ui-canonical 的汉化版本，旨在为中国用户提供中文界面和文档。**

# 安装

1. 获取 LXD snap 包

       sudo snap install lxd

   或者刷新确保至少安装了 5.21 LTS 版本。请注意，降级到之前的渠道将不可行。

       sudo snap refresh --channel=latest/stable lxd

   或者在 Fedora 系统上使用 dnf 安装:

       sudo dnf install lxd

2. 确保您的 LXD 服务器已暴露到网络中。例如监听所有可用接口的 8443 端口：

       lxc config set core.https_address :8443

3. 完成。在浏览器中输入服务器地址以访问 UI（例如在本地主机上，https://127.0.0.1:8443）。您可以在 [LXD 文档](https://documentation.ubuntu.com/lxd/en/latest/howto/access_ui/) 中找到有关 UI 的更多信息。

# 贡献

您可能想要：

- 阅读 [贡献指南](CONTRIBUTING.md)，了解我们的开发流程以及如何构建和测试您的更改。
- 在 GitHub 上[查看源码](https://github.com/canonical/lxd-ui)。

# 架构

LXD-UI 是一个使用 TypeScript 和 React 编写的单页应用程序。请参阅 [架构](ARCHITECTURE.MD) 了解与 [LXD](https://github.com/canonical/lxd) 的捆绑详情和开发设置。

# 更新日志

[更新日志](https://github.com/canonical/lxd-ui/releases) 会定期更新以反映每个新版本的变化。

# 路线图
未来计划和高优先级的功能及增强功能可在 [路线图](ROADMAP.md) 中找到。

# 示例

| 创建实例             | 实例列表               |
|----------------------|----------------------|
| ![create-instance](public/image/create-instance.png) | ![instance-list](public/image/instance-list.png) |

|  实例终端             | 图形控制台             |
|----------------------|----------------------|
| ![instance-terminal](public/image/instance-terminal.png) | ![instance-graphical-console](public/image/instance-graphical-console.png) |

| 存储池                | 存储卷                 |
|----------------------|----------------------|
| ![storage-pool-list](public/image/storage-pool-list.png)  | ![storage-volume-snap](public/image/storage-volume-snap.png) |

| 网络                  | 网络 ACL             | 
|----------------------|----------------------|
| ![network-detail](public/image/network-detail.png) | ![network-acl-create](public/image/network-acl-create.png) |

| 配置文件              | 警告                   |
|----------------------|----------------------|
| ![profile-list](public/image/profile-list.png) | ![warnings-list](public/image/warnings-list.png) |
