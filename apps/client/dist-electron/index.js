import { BrowserWindow, Tray, Menu, powerMonitor, dialog, app } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { exec } from "child_process";
const __dirname$2 = path.dirname(fileURLToPath(import.meta.url));
let win = null;
function getWindow() {
  return win;
}
function setWindow(window) {
  win = window;
}
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname$2, "..", "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.RENDERER_DIST, "index.html"));
  }
  win.on("close", (event) => {
    if (!process.env.IS_QUITING) {
      event.preventDefault();
      win == null ? void 0 : win.hide();
    }
  });
}
let tray = null;
function createTray() {
  tray = new Tray(path.join(process.env.VITE_PUBLIC, "icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Client",
      click: () => {
        const win2 = getWindow();
        win2 == null ? void 0 : win2.show();
        win2 == null ? void 0 : win2.focus();
      }
    }
  ]);
  tray.setToolTip("Euldans Client");
  tray.on("click", () => tray == null ? void 0 : tray.popUpContextMenu(contextMenu));
  tray.on("right-click", () => tray == null ? void 0 : tray.popUpContextMenu(contextMenu));
}
const IDLE_LIMIT = 300;
const SHUTDOWN_HOUR = 22;
const MEDIA_APPS = [
  "chrome",
  "msedge",
  "vlc",
  "windows media player",
  "youtube",
  "netflix"
];
const require$1 = createRequire(import.meta.url);
const activeWin = require$1("active-win");
async function getActiveApp() {
  var _a, _b;
  try {
    const w = await activeWin();
    return ((_b = (_a = w == null ? void 0 : w.owner) == null ? void 0 : _a.name) == null ? void 0 : _b.toLowerCase()) || "";
  } catch {
    return "";
  }
}
function shutdownPC() {
  exec("shutdown /s /t 0");
}
function showWarning() {
  const win2 = getWindow();
  if (!win2) return;
  dialog.showMessageBox(win2, {
    type: "warning",
    buttons: ["OK"],
    title: "Shutdown Warning",
    message: "System will shut down due to inactivity or scheduled time."
  });
}
async function shouldShutdown() {
  const idleSeconds = powerMonitor.getSystemIdleTime();
  const activeApp = await getActiveApp();
  const isMediaApp = MEDIA_APPS.some(
    (app2) => activeApp.includes(app2)
  );
  const now = /* @__PURE__ */ new Date();
  const isTimeReached = now.getHours() >= SHUTDOWN_HOUR;
  if (isMediaApp && idleSeconds < 1800) {
    return false;
  }
  if (idleSeconds >= IDLE_LIMIT) {
    return true;
  }
  if (isTimeReached) {
    return true;
  }
  return false;
}
function startMonitor() {
  setInterval(() => {
    const win2 = getWindow();
    if (!win2) return;
    const idleSeconds = powerMonitor.getSystemIdleTime();
    win2.webContents.send("idle-time", idleSeconds);
  }, 1e3);
  setInterval(async () => {
    const win2 = getWindow();
    if (!win2) return;
    const should = await shouldShutdown();
    if (should) {
      showWarning();
      setTimeout(() => {
        process.env.IS_QUITING = "true";
        shutdownPC();
      }, 1e4);
    }
  }, 5e3);
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  createTray();
  const win2 = getWindow();
  win2 == null ? void 0 : win2.hide();
  startMonitor();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    setWindow(null);
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
