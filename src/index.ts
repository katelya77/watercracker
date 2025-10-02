import "water.css/out/light.min.css";
import "./styles.css";
import "./writeValueLogging";
import { handleButtonClick } from "./bluetooth";
import { registerServiceWorker, resizeWindow, setupInstallButton } from "./pwaHelper";
import * as Sentry from "@sentry/browser";
import { isCsdn } from "./utils";

Sentry.init({
  dsn: "https://17d03841e2244d53abdbe587434efd5c@glitchtip.celeswuff.science/1",
});

(document.getElementById("version") as HTMLSpanElement).innerText = " · v" + VERSION;

// 检测蓝牙支持并显示状态
function checkBluetoothStatus() {
  const statusEl = document.getElementById("bluetooth-status");
  if (!statusEl) return;

  if (navigator.bluetooth) {
    statusEl.innerHTML = "✅ 浏览器支持蓝牙功能";
    statusEl.style.color = "rgba(144, 238, 144, 0.9)";
  } else {
    statusEl.innerHTML = "⚠️ 浏览器不支持蓝牙，功能可能受限";
    statusEl.style.color = "rgba(255, 182, 193, 0.9)";
  }
}

// 移除严格的蓝牙检测，默认显示主界面
// 仅在明确检测到CSDN时显示警告
if (isCsdn()) {
  (document.querySelector(".supported") as HTMLElement).style.display = "none";
  (document.querySelector(".unsupported") as HTMLElement).style.display = "none";
  (document.querySelector(".csdn-warning") as HTMLElement).style.display = "block";
} else {
  // 默认显示主界面，让用户自己判断是否支持蓝牙
  (document.querySelector(".supported") as HTMLElement).style.display = "block";
  (document.querySelector(".unsupported") as HTMLElement).style.display = "none";
  (document.querySelector(".csdn-warning") as HTMLElement).style.display = "none";
  
  // 检查并显示蓝牙状态
  setTimeout(checkBluetoothStatus, 100);
}

document.addEventListener("DOMContentLoaded", () => {
  const mainButton = document.getElementById("main-button") as HTMLButtonElement;
  mainButton.addEventListener("click", handleButtonClick);
});

// PWA
registerServiceWorker();
setupInstallButton();
resizeWindow();