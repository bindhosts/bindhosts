[English](README.md) | **简体中文** | [Türkçe](README_tr-TR.md) | [Italiano](README_it-IT.md)

# bindhosts

适用于 APatch、KernelSU 和 Magisk 的 Systemless hosts

完全无依赖，可自我更新。

## 特点

- 支持 WebUI 和 action 按钮 `action.sh`
- 可与 Adaway 共存
- 通过 Manager mount、bind mount 和 OverlayFS 实现的 Systemless hosts
- 所用重定向方法：ZN-hostsredirect、hosts_file_redirect、open_redirect

## 支持的 Root 管理器

- [APatch](https://github.com/bmax121/APatch) 
- [KernelSU](https://github.com/tiann/KernelSU)
- [Magisk](https://github.com/topjohnwu/Magisk)  <sup>([没有WebUI](https://github.com/topjohnwu/Magisk/issues/8609#event-15568590949)👀)</sup>

### 同时支持以下第三方模块管理器

- [KsuWebUI](https://github.com/5ec1cff/KsuWebUIStandalone)   <sup>🌐</sup>
- [MMRL](https://github.com/DerGoogler/MMRL)   <sup>▶ 🌐</sup>
- [WebUI-X](https://github.com/MMRLApp/WebUI-X-Portable)   <sup>🌐</sup>

## 另请参阅

- [使用手册](Documentation/usage_zh-CN.md)
- [隐藏指南](Documentation/hiding_zh-CN.md)
- [工作模式](Documentation/modes_zh-CN.md)

## 链接

- 点击 [此处](Documentation/faq.md) 查看常见问题
- 点击 [此处](https://github.com/bindhosts/bindhosts/releases) 下载 bindhosts
- 点击 [此处](Documentation/sources.md) 查看更多 hosts 规则源
- 点击 [此处](Documentation/localize.md) 了解 bindhosts 的本地化流程

## 帮助与支持

如果遇到问题请在 [这里](https://github.com/bindhosts/bindhosts/issues) 提交你的 issues

我们始终欢迎你们来提交 [请求](https://github.com/bindhosts/bindhosts/pulls)

## 基于GitHub520网站，获取、添加GitHub最新镜像IP，提升访问速度

采用在bindhosts.sh中后台(非阻塞方式)执行git_github_hosts.sh脚本方式实现

新增git_github_hosts.sh，将从 https://raw.hellogithub.com/hosts 下载最新GitHub镜像IP，写入/data/adb/bindhosts/custom_github.txt
