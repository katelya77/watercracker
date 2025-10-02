# 🛀 蓝牙水控器 FOSS

深圳市常工电子"蓝牙水控器"控制程序的开源实现。适用于国内各大高校宿舍热水器。

基于 [celesWuff/waterctl](https://github.com/celesWuff/waterctl) 进行美化优化。

![waterctl](waterctl.jpg)

## 🌟 在线使用

- 🌐 官方网站: <https://water.katelya.eu.org/>
- 🚀 GitHub Pages: <https://katelya77.github.io/watercracker/>
- 📖 使用指南: 参考 [FAQ.md](FAQ.md)

## ✨ 特性介绍

### 🎨 现代化UI设计

- 💎 渐变紫蓝色背景效果
- 🪟 玻璃磨砂质感卡片设计
- ✨ 流畅的按钮动画和悬停效果
- 📱 完美的响应式布局

### 🔧 核心功能

- 🌐 **完全离线使用** - 无需互联网连接
- 🔓 **开放自由** - 完全脱离"微信"控制
- ⚡ **极速响应** - 蓝牙直连，毫秒级响应
- 🖥️ **跨平台支持** - Windows/Linux/macOS/Android/iOS
- 💾 **PWA应用** - 可安装到桌面和手机
- 🎯 **简洁易用** - 一键开启/关闭
- 🔄 **智能适配** - 自动适配新版固件，解决协议更新问题

## 🚀 快速开始

### 方法1: 在线使用（推荐）

直接访问 <https://water.katelya.eu.org/>

### 方法2: 本地运行

```bash
# 克隆仓库
git clone https://github.com/katelya77/watercracker.git

# 安装依赖
cd watercracker
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

## 💡 使用说明

1. **打开网站** - 访问在线地址或本地运行
2. **检查蓝牙** - 确保浏览器支持蓝牙功能
3. **点击"开启"** - 选择你的水控器设备
4. **开始使用** - 点击"结束"停止

### 浏览器要求

- ✅ Chrome 88+ / Edge 88+
- ✅ Opera / Vivaldi
- ✅ 使用HTTPS协议（或localhost）
- ❌ iOS Chrome（受Apple限制，请使用Bluefy）

## � 新版固件适配

### 问题背景

近期深圳市常工电子的蓝牙水控器进行了固件更新，新增了额外的认证步骤和协议握手流程。

### 解决方案

我们开发了智能协议适配器，自动检测并适配不同版本的固件：

- **自动检测**: 根据数据包特征自动识别固件版本
- **智能适配**: 针对不同版本使用相应的协议流程
- **错误恢复**: 连接失败时自动重试，提高成功率

### 支持的固件版本

- ✅ **原版固件**: 使用标准协议
- ✅ **新版V1固件**: 支持0x7A/0x8E状态码
- ✅ **新版V2固件**: 支持0x98/0x04扩展协议

如果您的水控器最近无法连接，新版本应该能自动解决这个问题！

## �🛠️ 技术栈

- **前端框架**: TypeScript + Vite
- **样式方案**: CSS3 + Water.css
- **蓝牙通信**: Web Bluetooth API
- **构建工具**: Vite + PostCSS
- **部署平台**: GitHub Pages

## 📂 项目结构

```text
watercracker/
├── src/
│   ├── index.ts          # 主入口文件
│   ├── styles.css        # 样式文件
│   ├── bluetooth.ts      # 蓝牙通信逻辑
│   ├── protocolAdapter.ts # 新版固件协议适配器 🆕
│   ├── solvers.ts        # 算法实现
│   └── utils.ts          # 工具函数
├── public/               # 静态资源
├── dist/                 # 构建输出
└── index.html           # HTML模板
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📜 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

- 原始代码版权归 [celesWuff](https://github.com/celesWuff) 所有
- UI 优化版本由 [katelya77](https://github.com/katelya77) 开发维护

## 🙏 致谢

特别感谢 [celesWuff](https://github.com/celesWuff) 提供的原始实现和技术支持。

## 📞 联系方式

- GitHub: [@katelya77](https://github.com/katelya77)
- Issues: [提交问题](https://github.com/katelya77/watercracker/issues)

---

⭐ 如果这个项目对你有帮助，请给一个Star！
