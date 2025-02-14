# 隐藏指南

## APatch
在 APatch 上隐藏应正常工作，前提是使用[最新版本](https://github.com/bmax121/APatch/releases/latest)
 - 对需要对其隐藏 root 的应用启用"排除修改"
 - 启用 [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext) 的遵循排除列表

旧版 APatch 因潜在问题不再推荐，但可尝试以下方案：
   - 启用排除修改 + [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext) 的遵循排除列表
   - 虽然不再推荐，仍可尝试使用 hosts_file_redirect kpm [使用教程](https://github.com/bindhosts/bindhosts/issues/3)
   - 若 hosts_file_redirect 失败，请安装 [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU
 在 KernelSU 上隐藏应该能正常工作, 只要:
  1. 内核有 path_umount (GKI, backported)
  2. 不存在冲突模块 (即 Magical Overlayfs)

 建议:
  - 若为非 gki 内核且内核不包含 path_umount，请咨询内核开发者 [backport 该功能特性](https://github.com/tiann/KernelSU/pull/1464)
  - 还有一个替代方案, 只需安装 [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### 其他分支 (MKSU, KernelSU-NEXT)
 - 对于 MKSU, 可以使用 [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/)
 - 对于 KernelSU-NEXT, 隐藏应正常工作 (通过模式 6)

### SuSFS
 - 对于 SuSFS, 应正常工作

## Magisk
 在 Magisk (和其分支) 应正常工作。
 - 将需要对其隐藏 root 的应用添加至排除列表。
 - (可选) 安装 [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/)

# 常见问题
 - 为什么要隐藏对 hosts 文件的修改?
   - 一些 root 检测手段会检测 hosts 文件是否被修改。
 - 我该如何检查该检测点?
   - 阅读 [如何检查检测点](https://github.com/bindhosts/bindhosts/issues/4)
 - 我该如何迁移 APatch 至 bind mount?
   - [在此处](https://nightly.link/bmax121/APatch/workflows/build/main/APatch) 下载 ci 构建版本

## 术语表
 - bind mount - magic mount 在 APatch 中的术语，挂载办法主要源自 Magisk。
