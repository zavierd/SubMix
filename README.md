# SubMix

🚀 一个强大的代理订阅链接转换器，将单独的代理订阅链接转换为 Mihomo 内核 YAML 配置文件

## 功能特性

- ✅ 支持多种代理协议：VLESS、Hysteria2、Shadowsocks、Trojan
- ✅ 自动解析订阅链接并生成标准 YAML 配置
- ✅ 智能节点解析和管理功能
- ✅ 现代化的 Web 界面，支持深色模式
- ✅ 基于 @Loyalsoldier/clash-rules 的完整规则集
- ✅ 一键下载生成的配置文件

## 支持的协议格式

### VLESS
```
vless://uuid@server:port?param1=value1&param2=value2#name
```
支持的参数：
- `type`: 传输协议 (tcp, ws, grpc)
- `security`: 安全层 (tls, reality)
- `sni`: SNI 域名
- `alpn`: ALPN 协议
- `path`: WebSocket 路径
- `host`: WebSocket Host 头
- `serviceName`: gRPC 服务名
- `flow`: 流控设置

### Hysteria2
```
hysteria2://password@server:port?param1=value1&param2=value2#name
hy2://password@server:port?param1=value1&param2=value2#name
```
支持的参数：
- `obfs`: 混淆类型
- `obfs-password`: 混淆密码
- `sni`: SNI 域名
- `alpn`: ALPN 协议
- `up`: 上行带宽 (Mbps)
- `down`: 下行带宽 (Mbps)
- `skip-cert-verify`: 跳过证书验证

### Shadowsocks (支持 SS 和 SS2022)
```
ss://method:password@server:port#name
ss://base64(method:password)@server:port#name
```

**传统 SS 加密方法：**
- aes-128-gcm / aes-256-gcm
- aes-128-cfb / aes-256-cfb  
- aes-128-ctr / aes-256-ctr
- chacha20-ietf / chacha20-ietf-poly1305
- xchacha20-ietf-poly1305
- rc4-md5

**SS2022 新型加密方法：**
- 2022-blake3-aes-128-gcm
- 2022-blake3-aes-256-gcm
- 2022-blake3-chacha20-poly1305

> SS2022 提供更强的安全性和性能，建议优先使用

### Trojan
```
trojan://password@server:port?param1=value1&param2=value2#name
```
支持的参数：
- `sni`: SNI 域名
- `alpn`: ALPN 协议
- `type`: 传输协议 (tcp, ws, grpc)
- `path`: WebSocket 路径
- `host`: WebSocket Host 头
- `skip-cert-verify`: 跳过证书验证

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
pnpm start
```

## 使用方法

1. 打开 SubMix 应用主页
2. 在左侧输入框中逐个粘贴您的订阅链接
3. 点击"解析并添加"按钮添加节点
4. 编辑节点信息，调整节点顺序
5. 选择路由模式（白名单/黑名单）
6. 系统自动生成完整的 Mihomo YAML 配置
7. 复制或下载生成的配置文件

## 界面特性

- 🎨 现代化的 shadcn/ui 设计系统
- 🌙 支持深色模式
- 📱 完全响应式设计
- 🔔 实时通知反馈
- ⚡ 流畅的用户体验

## 配置说明

SubMix 自动生成完整的 Mihomo 配置，包含：

### 代理组配置
- **🚀 手动切换**：手动选择代理节点
- **♻️ 自动选择**：基于延迟自动选择最快节点
- **🔯 故障转移**：主节点故障时自动切换
- **🔮 负载均衡**：在多个节点间平衡负载
- **🛑 广告拦截**：阻止广告和跟踪
- **🎯 全球直连**：直接连接

### 路由模式
- **白名单模式**：未匹配规则的流量走代理（推荐）
- **黑名单模式**：只有指定流量走代理

### 规则集
基于 @Loyalsoldier/clash-rules，包含：
- 广告拦截、隐私保护
- Apple、Google、iCloud 服务优化
- GFW 列表、直连域名
- 中国大陆 IP 段
- Telegram 专用规则

## 技术栈

- **前端**: Next.js 15 + TypeScript + Tailwind CSS
- **UI 组件**: shadcn/ui + Radix UI
- **图标**: Lucide React
- **通知**: Sonner
- **包管理**: pnpm
- **后端**: Next.js API Routes
- **YAML 处理**: js-yaml
- **协议解析**: 自定义解析器

## 部署指南

### 一键部署

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/YoungLee-coder/SubMix)

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-orange?style=for-the-badge&logo=cloudflare)](https://dash.cloudflare.com/?to=/:account/pages/new)

> **注意**: 点击 Vercel 按钮会自动导入本项目模板到您的 Vercel 账户进行部署。
> 
> **Cloudflare Pages**: 点击按钮进入 Cloudflare Pages 控制台，然后选择"连接到 Git"来部署此项目。

### 手动部署到 Vercel

1. **Fork 此仓库**：点击页面右上角的 "Fork" 按钮，将项目复制到您的 GitHub 账户

2. **注册或登录 Vercel**：前往 [Vercel 官网](https://vercel.com/) 注册或登录您的账户

3. **导入项目**：
   - 在 Vercel 仪表板中，点击 "New Project" 按钮
   - 从您的 GitHub 仓库列表中选择刚刚 Fork 的项目
   - 或者直接使用一键部署按钮自动导入

4. **配置项目设置**：
   - **框架预设**：Next.js（自动检测）
   - **构建命令**：`npm run build`
   - **输出目录**：`.next`（默认）
   - **安装命令**：`npm install`

5. **部署项目**：点击 "Deploy" 按钮，Vercel 将自动构建并部署您的项目

### 手动部署到 Cloudflare Pages

1. **Fork 此仓库**：点击页面右上角的 "Fork" 按钮，将项目复制到您的 GitHub 账户

2. **注册或登录 Cloudflare**：前往 [Cloudflare 官网](https://www.cloudflare.com/) 注册或登录您的账户

3. **创建新的 Pages 项目**：
   - 点击上方的 Cloudflare Pages 部署按钮，或手动前往 [Cloudflare Pages 控制台](https://dash.cloudflare.com/?to=/:account/pages/new)
   - 点击 "Create application"，然后选择 "Pages"
   - 选择 "Connect to Git"，并授权 Cloudflare 访问您的 GitHub 账户
   - 选择您刚刚 Fork 的仓库

4. **配置构建设置**：
   - **生产分支**：`main` 或 `master`
   - **构建命令**：`npm run build`
   - **构建输出目录**：`.next`
   - **根目录**：`/`（默认）

5. **部署项目**：点击 "Save and Deploy" 按钮，Cloudflare Pages 将开始构建并部署您的项目

### 自定义域名

部署完成后，您可以：

- **Vercel**：在项目设置中绑定自定义域名
- **Cloudflare Pages**：在 Pages 项目设置中配置自定义域名

### 快速开始部署

1. **Fork 此项目**到您的 GitHub 账户
2. **点击上方的一键部署按钮**选择您偏好的平台
3. **等待自动构建完成**（通常需要1-3分钟）
4. **获得您的专属部署链接**

### 部署注意事项

- ✅ 项目开箱即用，无需额外配置
- ✅ 支持 Node.js 18+ 环境
- ✅ 自动启用 HTTPS 和全球 CDN 加速
- ✅ 支持自定义域名绑定
- ⚠️ 如果使用 pnpm，建议在构建设置中指定包管理器
- 💡 首次部署可能需要 2-5 分钟，后续更新会更快

## 文件结构

```
├── app/
│   ├── api/convert/route.ts    # 转换 API 端点
│   ├── page.tsx               # 主页面
│   └── layout.tsx             # 布局文件
├── components/ui/             # shadcn/ui 组件
│   ├── button.tsx
│   ├── card.tsx
│   ├── textarea.tsx
│   └── ...
├── lib/
│   ├── proxy-parser.ts        # 代理协议解析器
│   ├── mihomo-config.ts       # Mihomo 配置生成器
│   └── utils.ts               # 工具函数
└── README.md
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 免责声明

本工具仅用于学习和测试目的，请遵守当地法律法规。