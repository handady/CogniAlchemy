# CogniAlchemy

CogniAlchemy 是一个基于 Electron 和 React 的桌面应用，旨在通过知识泡泡的形式展示与管理知识。该项目采用了单仓库（monorepo）结构，将 Electron 主进程代码和 React 渲染进程代码分离管理。

## 项目结构

CogniAlchemy 项目的目录结构如下：

--------------------------------------------------
CogniAlchemy/
├── package.json           // 顶层配置文件，包含全局脚本与依赖（如使用 monorepo 工具时）
├── electron/              // Electron 主进程代码
│   ├── main.js            // Electron 入口文件
│   └── preload.js         // 预加载脚本（可选）
└── react-app/             // React 渲染进程（前端应用）
    ├── package.json       // React 项目的依赖与配置
    ├── public/            // 静态资源目录
    └── src/               // React 源码
--------------------------------------------------

## 环境要求

- Node.js v18.0.0 或以上（建议使用 LTS 版本）
- npm 或 yarn（请确保使用相同包管理器进行依赖安装）

## 安装依赖

在新电脑或克隆项目后，需要分别在根目录、electron 和 react-app 下安装依赖。

1. 根目录（如果有全局依赖）：  
   运行命令：`npm install`

2. Electron 目录：  
   进入 electron 文件夹，运行命令：`npm install`

3. React 应用目录：  
   进入 react-app 文件夹，运行命令：`npm install`

（注意：如果您希望统一管理依赖，可以考虑使用 Yarn Workspaces、pnpm 或 Lerna 等 monorepo 管理工具。）

## 开发与运行

### 开发模式

建议在开发阶段分别启动 React 开发服务器和 Electron 应用，以便调试。

1. 启动 React 开发服务器：  
   进入 react-app 目录，运行命令：`npm start`  
   默认 React 应用会运行在 [http://localhost:3000](http://localhost:3000)

2. 启动 Electron 应用：  
   在项目根目录下（或单独的终端中）运行命令：`npm run start:electron`  
   Electron 主进程会检测环境变量 `ELECTRON_START_URL`，在开发模式下加载 [http://localhost:3000](http://localhost:3000)

或者，您可以使用 `concurrently` 工具同时启动两个服务（请确保顶层 package.json 中配置了相应脚本），运行命令：`npm run start`

### 打包发布

1. 打包 React 应用：  
   进入 react-app 目录，运行命令：`npm run build`

2. Electron 应用将加载 react-app/build 中的静态文件，请确保 Electron 配置正确加载打包后的文件。例如，在 electron/main.js 中加载：
   ```javascript
   const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../react-app/build/index.html')}`;
   win.loadURL(startUrl);
