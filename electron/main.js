// electron/main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    path.join(__dirname, "../react-app/dist/index.html");
  win.loadURL(startUrl);

  // 打开开发者工具
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // 引入 IPC 处理程序模块
  require("./ipc-handlers/graphHandlers");
  require("./ipc-handlers/tagHandlers");
  require("./ipc-handlers/nodeDetailsHandlers");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
