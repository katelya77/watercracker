import "water.css/out/light.min.css";
import "./styles.css";
import "./writeValueLogging";
import { handleButtonClick } from "./bluetooth";
import { registerServiceWorker, resizeWindow, setupInstallButton } from "./pwaHelper";
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://17d03841e2244d53abdbe587434efd5c@glitchtip.celeswuff.science/1",
});

(document.getElementById("version") as HTMLSpanElement).innerText = " · v" + VERSION;

// 检测蓝牙支持并显示状态
function checkBluetoothStatus() {
  const statusEl = document.getElementById("bluetooth-status");
  if (!statusEl) {
    console.log("未找到蓝牙状态元素，将重试...");
    // 如果元素还没找到，延时重试
    setTimeout(checkBluetoothStatus, 200);
    return;
  }

  console.log("开始检测蓝牙支持...");
  
  try {
    // 检查浏览器蓝牙API可用性
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      statusEl.innerHTML = "✅ 浏览器支持蓝牙功能";
      statusEl.style.color = "rgba(144, 238, 144, 0.9)";
      console.log("蓝牙支持检测完成：支持");
    } else {
      statusEl.innerHTML = "⚠️ 浏览器不支持蓝牙，功能可能受限";
      statusEl.style.color = "rgba(255, 182, 193, 0.9)";
      console.log("蓝牙支持检测完成：不支持");
    }
  } catch (error) {
    statusEl.innerHTML = "❌ 蓝牙检测出错";
    statusEl.style.color = "rgba(255, 182, 193, 0.9)";
    console.error("蓝牙检测错误:", error);
  }
}

// 初始化标志，避免重复初始化
let isInitialized = false;

// 初始化函数
function initialize() {
  if (isInitialized) {
    console.log("应用已初始化，跳过重复初始化");
    return;
  }
  
  console.log("开始初始化应用...");
  
  // 确保主界面显示
  const mainEl = document.querySelector(".supported") as HTMLElement;
  if (mainEl) {
    mainEl.style.display = "block";
    console.log("主界面已显示");
  }
  
  // 延时检查蓝牙状态，确保DOM完全加载
  setTimeout(checkBluetoothStatus, 50);
  
  // 绑定按钮事件
  const mainButton = document.getElementById("main-button") as HTMLButtonElement;
  if (mainButton) {
    mainButton.addEventListener("click", handleButtonClick);
    console.log("按钮事件已绑定");
  } else {
    console.log("未找到主按钮，将重试...");
    setTimeout(() => {
      const retryButton = document.getElementById("main-button") as HTMLButtonElement;
      if (retryButton) {
        retryButton.addEventListener("click", handleButtonClick);
        console.log("按钮事件已绑定（重试成功）");
      }
    }, 100);
  }
  
  isInitialized = true;
  console.log("应用初始化完成");
}

// 确保DOM加载完成后执行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  // DOM已经加载完成，直接初始化
  setTimeout(initialize, 10);
}

// PWA
registerServiceWorker();
setupInstallButton();
resizeWindow();