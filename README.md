# Anydocs

AI 时代的本地优先文档编辑器。

Anydocs 当前包含三部分能力：

- `Studio`：本地编辑台，使用 Yoopta 编辑页面内容、导航与项目设置
- `CLI`：初始化、构建、预览、导入文档项目
- `Docs Reader`：面向发布内容的静态阅读站

## 当前事实

- `pnpm dev` 只启动 Studio 开发环境，入口在 `http://localhost:3000/` 和 `http://localhost:3000/studio`
- 阅读站的规范路由是 `/{lang}` 和 `/{lang}/{slug}`，`/docs/*` 与 `/{lang}/docs/*` 目前只是兼容性跳转入口
- 阅读站不会在普通 `pnpm dev` 下开放；请使用 CLI `preview` 或构建后的静态产物查看
- 构建产物是 flat 输出，不再使用旧的 `dist/projects/default/...` 结构

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动 Studio

```bash
pnpm dev
```

打开：

- `http://localhost:3000/`
- `http://localhost:3000/studio`

### 3. 预览示例项目

```bash
pnpm --filter @anydocs/cli cli preview examples/demo-docs
```

CLI 会启动一个本地预览服务，并输出可访问的阅读站 URL。

### 4. 构建示例项目

```bash
pnpm --filter @anydocs/cli cli build examples/demo-docs
```

默认输出到 `examples/demo-docs/dist/`。

## 常用命令

### 仓库根脚本

```bash
pnpm dev            # 启动 Next.js Studio
pnpm dev:desktop    # 启动 Electron 桌面端
pnpm build          # 构建整个 workspace
pnpm build:web      # 构建 web 包
pnpm build:cli      # 构建 CLI 包
pnpm build:desktop  # 构建桌面端
pnpm typecheck      # 全仓 TypeScript 检查
pnpm lint           # 全仓 ESLint
pnpm test           # core + cli 测试
pnpm test:web       # web Playwright 测试
pnpm test:full      # 全量测试
```

### CLI

推荐在 monorepo 根目录使用：

```bash
pnpm --filter @anydocs/cli cli <command>
```

也可以直接执行入口：

```bash
node --experimental-strip-types packages/cli/src/index.ts <command>
```

可用命令：

```bash
pnpm --filter @anydocs/cli cli init [targetDir]
pnpm --filter @anydocs/cli cli build [targetDir] [--output <dir>] [--watch]
pnpm --filter @anydocs/cli cli preview [targetDir] [--watch]
pnpm --filter @anydocs/cli cli import <sourceDir> [targetDir] [lang]
pnpm --filter @anydocs/cli cli convert-import <importId> [targetDir]
pnpm --filter @anydocs/cli cli help [command]
pnpm --filter @anydocs/cli cli version
```

说明：

- `preview` 默认就是 live 模式，`--watch` 仅保留兼容含义
- `build --output <dir>` 会覆盖默认产物输出目录

## 文档项目结构

一个当前实现兼容的文档项目目录通常长这样：

```text
my-docs/
├── anydocs.config.json
├── anydocs.workflow.json
├── skill.md                 # 可选；当前 init 会生成
├── pages/
│   ├── en/
│   └── zh/
├── navigation/
│   ├── en.json
│   └── zh.json
├── imports/
└── dist/
```

说明：

- `anydocs.config.json` 是项目配置
- `anydocs.workflow.json` 是工作流契约
- `skill.md` 是可选的项目辅助文档；当前 `init` 会一并生成
- `pages/` 与 `navigation/` 是 Studio 和 CLI 的 canonical source
- `imports/` 用于承接 legacy import 中间产物

## 构建产物结构

当前构建输出为 flat 结构，典型结果如下：

```text
dist/
├── index.html
├── llms.txt
├── search-index.en.json
├── search-index.zh.json
├── mcp/
│   ├── index.json
│   ├── navigation.en.json
│   ├── navigation.zh.json
│   ├── pages.en.json
│   └── pages.zh.json
├── en/
├── zh/
└── docs/
```

其中：

- `en/`、`zh/` 是规范阅读站路由
- `docs/` 是默认语言兼容入口
- `llms.txt` 与 `mcp/` 只包含 `published` 内容

## 架构概览

### Studio

- 路由：`/`、`/studio`
- 主要用途：编辑页面、导航、项目设置
- 数据读写：`/api/local/*` 或桌面端 IPC
- 可见状态：`draft`、`in_review`、`published`

### Docs Reader

- 规范路由：`/{lang}`、`/{lang}/{slug}`
- 兼容跳转：`/docs/*`、`/{lang}/docs/*`
- 只读取 `published` 页面
- 搜索依赖构建期生成的静态索引

### CLI

- `init`：初始化项目
- `build`：生成静态站点与机器可读产物
- `preview`：启动本地阅读站预览
- `import` / `convert-import`：导入 legacy Markdown/MDX

## 部署

构建结果是纯静态文件，可以部署到任意静态托管环境，例如：

- Nginx / Apache
- Vercel / Netlify / Cloudflare Pages
- GitHub Pages
- AWS S3 / OSS

示例：

```bash
pnpm --filter @anydocs/cli cli build ./my-docs --output ./dist-prod
```

随后部署 `./dist-prod/` 即可。

## 相关文档

- [docs/README.md](docs/README.md)
- [docs/planning-artifacts/architecture.md](docs/planning-artifacts/architecture.md)
- [docs/planning-artifacts/prd.md](docs/planning-artifacts/prd.md)
- [docs/planning-artifacts/epics.md](docs/planning-artifacts/epics.md)
- [docs/04-usage-manual.md](docs/04-usage-manual.md)
- [docs/05-dev-guide.md](docs/05-dev-guide.md)
