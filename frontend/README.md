# Feed Music 前端应用

基于 React 构建的现代化音乐资讯前端应用，提供动态背景、响应式设计和流畅的用户体验。

## 🚀 功能特性

- **动态首页**: 视频背景 + 文字滚动效果
- **响应式新闻**: 自适应网格布局，支持分页加载
- **用户认证**: 注册、登录、权限管理
- **新闻管理**: 创建、编辑、删除新闻（管理员）
- **页面切换**: 流畅的页面转场动画
- **移动端优化**: 完美适配各种设备尺寸

## 📋 技术栈

- **框架**: React 18+
- **路由**: React Router v6
- **状态管理**: React Context API
- **样式**: SCSS + CSS Modules
- **HTTP客户端**: Axios
- **构建工具**: Create React App

## 🏗️ 项目结构

```
frontend/
├── public/                 # 静态资源
│   ├── videos/            # 背景视频
│   └── images/            # 图片资源
├── src/
│   ├── components/        # 组件
│   │   ├── common/       # 通用组件
│   │   ├── Introduction/ # 首页组件
│   │   └── News/         # 新闻组件
│   ├── contexts/         # React Context
│   ├── pages/            # 页面组件
│   ├── services/         # API服务
│   ├── utils/            # 工具函数
│   └── assets/           # 资源文件
└── package.json          # 依赖配置
```

## 🛠️ 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装步骤

1. **进入前端目录**
```bash
cd frontend
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **配置环境变量**
```bash
# 创建 .env 文件
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_UPLOAD_URL=http://localhost:8000
```

4. **启动开发服务器**
```bash
npm start
# 或指定端口
PORT=3001 npm start
```

## 📜 可用脚本

在项目目录中，你可以运行以下命令：

### `npm start`

在开发模式下运行应用。\
打开 [http://localhost:3000](http://localhost:3000) 在浏览器中查看。

当你修改代码时页面会自动重新加载。\
控制台会显示任何 lint 错误。

### `npm test`

在交互式监视模式下启动测试运行器。\
查看 [运行测试](https://facebook.github.io/create-react-app/docs/running-tests) 了解更多信息。

### `npm run build`

构建生产版本到 `build` 文件夹。\
正确地将 React 打包为生产模式并优化构建以获得最佳性能。

构建是压缩的，文件名包含哈希值。\
你的应用已准备好部署！

查看 [部署](https://facebook.github.io/create-react-app/docs/deployment) 了解更多信息。

## 🚀 部署

### Vercel 部署（推荐）

1. **构建项目**
```bash
npm run build
```

2. **部署到 Vercel**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 静态文件服务器

```bash
# 使用 serve
npm install -g serve
serve -s build -l 3000

# 使用 http-server
npm install -g http-server
http-server build
```

## 🔧 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 组件使用 PascalCase 命名
- 文件使用 camelCase 命名

### 组件开发
- 优先使用函数组件和 Hooks
- 合理拆分组件，保持单一职责
- 使用 PropTypes 进行类型检查
- 添加适当的注释和文档

### 样式管理
- 使用 SCSS 进行样式开发
- 采用 BEM 命名规范
- 响应式设计优先
- 使用 CSS 变量管理主题

### `npm run eject`

**注意：这是一个单向操作。一旦你 `eject`，就无法回退！**

如果你对构建工具和配置选择不满意，可以随时 `eject`。此命令将从项目中删除单个构建依赖项。

## 📚 学习资源

- [Create React App 文档](https://facebook.github.io/create-react-app/docs/getting-started)
- [React 官方文档](https://reactjs.org/)
- [React Router 文档](https://reactrouter.com/)
- [SCSS 文档](https://sass-lang.com/documentation)

## 🐛 故障排除

### 常见问题

1. **端口被占用**
```bash
# 查找占用端口的进程
lsof -ti:3000
# 杀死进程
kill -9 <PID>
```

2. **依赖安装失败**
```bash
# 清除缓存
npm cache clean --force
# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

3. **构建失败**
```bash
# 检查 Node.js 版本
node --version
# 更新到最新 LTS 版本
```

## 📄 许可证

MIT License
