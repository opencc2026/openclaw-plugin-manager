# OpenClaw Plugin Manager

![ClawHub](https://img.shields.io/clawhub/v/openclaw-plugin-manager)
![GitHub Actions](https://github.com/opencc2026/openclaw-plugin-manager/actions/workflows/publish-to-clawhub.yml/badge.svg)
![License](https://img.shields.io/github/license/opencc2026/openclaw-plugin-manager)
![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![CLI Tool](https://img.shields.io/badge/CLI-tool-blue)

一个强大的OpenClaw插件管理器，帮助用户发现、安装和管理OpenClaw插件。

## 🎯 功能概述

这个技能提供OpenClaw插件的一站式管理解决方案，包括插件发现、安装、更新、配置和诊断功能。

## 🛠️ 核心功能

### 1. 插件发现和推荐
- **浏览推荐插件** - 查看官方和社区推荐的插件
- **搜索插件** - 按功能或关键词搜索插件
- **分类浏览** - 按类别（开发、办公、AI等）浏览插件
- **热门排行** - 查看最受欢迎的插件

### 2. 自动安装和管理
- **一键安装** - 自动下载和安装插件
- **依赖处理** - 自动安装插件依赖
- **配置向导** - 引导用户完成插件配置
- **冲突检测** - 检测和解决插件冲突

### 3. 插件维护
- **更新检查** - 检查插件更新
- **批量更新** - 一键更新所有插件
- **卸载清理** - 安全卸载插件并清理配置
- **备份恢复** - 备份和恢复插件配置

## 🚀 快速开始

### 安装
```bash
# 使用clawhub安装
clawhub install opencc2026/openclaw-plugin-manager

# 或者从源码安装
git clone https://github.com/opencc2026/openclaw-plugin-manager.git
cd openclaw-plugin-manager
npm install -g .
```

### 基本使用
```bash
# 查看推荐插件列表
openclaw-plugins list

# 搜索插件
openclaw-plugins search "feishu"

# 安装插件
openclaw-plugins install feishu-doc

# 批量安装常用插件
openclaw-plugins install-essential

# 更新所有插件
openclaw-plugins update --all
```

## 📖 详细使用指南

### 插件发现
```bash
# 查看所有推荐插件
openclaw-plugins list --all

# 按类别查看
openclaw-plugins list --category=development
openclaw-plugins list --category=productivity

# 查看插件详情
openclaw-plugins info feishu-doc
```

### 插件管理
```bash
# 查看已安装插件
openclaw-plugins installed

# 检查更新
openclaw-plugins check-updates

# 更新插件
openclaw-plugins update feishu-doc

# 卸载插件
openclaw-plugins uninstall feishu-doc --clean
```

## 📁 项目结构
```
openclaw-plugin-manager/
├── README.md
├── SKILL.md
├── package.json
├── .github/workflows/
│   └── publish-to-clawhub.yml
├── bin/
│   └── openclaw-plugins.js      # CLI入口
├── src/
│   └── index.js                 # 核心管理器
├── example-plugins.json         # 示例插件数据
└── tests/
    └── basic.test.js
```

## 🔧 开发指南

### 添加新功能
1. 在 `src/` 目录扩展功能模块
2. 更新CLI命令在 `bin/openclaw-plugins.js`
3. 编写测试用例
4. 更新文档

### 插件源扩展
支持添加新的插件源，只需实现相应的数据获取接口。

## 🤝 贡献

欢迎贡献新功能或改进现有功能！

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 📄 许可证

MIT License - 详见LICENSE文件

## 🆘 支持

- 问题报告: [GitHub Issues](https://github.com/opencc2026/openclaw-plugin-manager/issues)
- 讨论: [GitHub Discussions](https://github.com/opencc2026/openclaw-plugin-manager/discussions)
- 文档: 项目Wiki

## 🔄 自动发布

本项目使用GitHub Actions自动发布到ClawHub。功能包括：

### 触发条件
- 推送到main分支
- Pull Request合并
- 手动触发
- 每周定时检查

### 发布流程
1. ✅ 代码检查
2. ✅ 测试运行
3. ✅ 技能验证
4. ✅ ClawHub登录
5. ✅ 自动发布
6. ✅ 文档更新

### 设置要求
1. 在GitHub仓库设置中添加 `CLAWHUB_TOKEN` 密钥
2. 确保Token有发布权限

---

**呷呷！让OpenClaw插件管理变得简单高效！** 🎯