# Local Agent

> 基于本地大语言模型的智能助手，让 AI 能力真正掌握在你手中。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](./README.md) | 简体中文

## 📖 简介

Local Agent 是一个基于 Next.js 开发的本地优先的 AI 助手应用。它支持多种本地大语言模型，让用户可以在保护隐私的同时享受 AI 带来的便利。

### ✨ 特性

- 🤖 支持多种模型后端
  - Ollama 本地模型
  - WebLLM 浏览器端模型
  - Chrome AI API
- 🌈 现代化 UI 界面
- 🔄 流式响应
- 🌙 深色模式支持
- 💾 本地数据存储
- 📱 响应式设计

## 🏗️ 系统架构

```ascii
┌────────────────── Local Agent ─────────────────────────┐
│                                                        │
│  ┌─────────────── Presentation Layer ──────────────┐   │
│  │                                                 │   │
│  │  ┌─ Next.js Pages ─┐    ┌─── Components ────┐   │   │
│  │  │  • layout.tsx   │    │ • ChatWindow      │   │   │
│  │  │  • page.tsx     │    │ • ModelSetups     │   │   │
│  │  │  • globals.css  │    │ • ThemeToggle     │   │   │
│  │  └─────────────────┘    └───────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─────────────── Application Layer ───────────────┐   │
│  │                                                 │   │
│  │  ┌─ Web Workers ──┐    ┌─── State Mgmt ────┐    │   │
│  │  │  • Model       │    │ • React Hooks     │    │   │
│  │  │    Processing  │    │ • Context API     │    │   │
│  │  │  • Streaming   │    │ • Local Storage   │    │   │
│  │  └────────────────┘    └───────────────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─────────────── Integration Layer ───────────────┐   │
│  │                                                 │   │
│  │  ┌─ AI Models ────┐    ┌─── APIs ──────────┐    │   │
│  │  │  • Ollama      │    │ • LangChain       │    │   │
│  │  │  • WebLLM      │    │ • Chrome AI       │    │   │
│  │  │  • Local LLMs  │    │ • Http API        │    │   │
│  │  └────────────────┘    └───────────────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘

```

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn
- （可选）Ollama
- （可选）Chrome 浏览器

### 安装

```bash
# 克隆项目
git clone https://github.com/euraxluo/local-agent.git
cd local-agent

# 安装依赖
yarn install

# 启动开发服务器
yarn run dev
```

## 🛠️ 技术栈

### 1. 前端框架与UI
- **Next.js 14**: App Router, React Server Components, SSR
- **TailwindCSS**: 响应式设计, 深色模式, JIT 编译
- **TypeScript**: 类型安全, 开发体验优化

### 2. 状态管理与数据流
- **React Hooks**: 自定义 hooks, 状态管理
- **Context API**: 主题管理, 全局状态
- **LocalStorage**: 数据持久化

### 3. AI 模型集成
- **LangChain.js**: 模型接口统一, 流式处理
- **Web Workers**: 计算分离, 性能优化
- **后端多推理类型支持**: Ollama, WebLLM, Chrome AI

## 📁 项目结构

```
local-agent/
├── app/                    # Next.js 应用目录
│   ├── layout.tsx         # 全局布局
│   ├── page.tsx          # 主页面
│   ├── worker.ts         # Web Worker
│   └── globals.css       # 全局样式
├── components/            # React 组件
│   ├── ChatWindow.tsx    # 聊天窗口
│   ├── OllamaSetup.tsx   # Ollama 配置
│   ├── WebLLMSetup.tsx   # WebLLM 配置
│   └── ...
└── lib/                  # 工具函数
    ├── storage.ts        # 存储管理
    └── hooks.ts          # React Hooks
```

## 📝 开发计划

### 近期计划
- [ ] 语音输入/输出支持
- [ ] 图像生成能力
- [ ] 插件系统
- [ ] 提示词管理

### 长期计划
- [ ] 多模型协同
- [ ] 知识库集成
- [ ] 性能优化

## 🤝 贡献指南

我们欢迎所有形式的贡献，无论是新功能、bug 修复还是文档改进。详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 贡献步骤

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [LangChain](https://js.langchain.com/)
- [Ollama](https://ollama.ai/)
- [WebLLM](https://webllm.mlc.ai/)

## 📬 联系方式

- 作者：Euraxluo
- 邮箱：euraxluo@gmail.com
- 问题反馈：[GitHub Issues](https://github.com/username/local-agent/issues)
