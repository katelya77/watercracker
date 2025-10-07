import "water.css/out/light.min.css";
import "./styles.css";
import "./writeValueLogging";
import { handleButtonClick } from "./bluetooth";
import { registerServiceWorker, resizeWindow, setupInstallButton } from "./pwaHelper";
import * as Sentry from "@sentry/browser";

// 🔥 全局暴露关键函数确保100%可靠
declare global {
  interface Window {
    startWaterController: () => void;
    clearPairedDevices: () => void;
  }
}

window.startWaterController = function() {
  console.log("🚀 全局函数被调用：启动水控器");
  try {
    handleButtonClick();
  } catch (error) {
    console.error("启动水控器失败:", error);
    alert("启动失败: " + error);
  }
};

window.clearPairedDevices = async function() {
  console.log("🧹 全局函数被调用：清除配对设备");
  try {
    if (!navigator.bluetooth || !navigator.bluetooth.getDevices) {
      alert("您的浏览器不支持获取已配对设备");
      return;
    }
    
    const devices = await navigator.bluetooth.getDevices();
    console.log("已配对设备:", devices);
    
    if (devices.length === 0) {
      alert("没有已配对的蓝牙设备");
      return;
    }
    
    let clearedCount = 0;
    for (const device of devices) {
      if (device.forget) {
        await device.forget();
        clearedCount++;
        console.log("已清除设备:", device.name || device.id);
      }
    }
    
    if (clearedCount > 0) {
      alert(`已清除 ${clearedCount} 个已配对设备\n页面将刷新以应用更改`);
      window.location.reload();
    } else {
      alert("浏览器不支持清除配对设备");
    }
  } catch (error) {
    console.error("清除配对设备失败:", error);
    alert("清除配对设备失败: " + (error as Error).message);
  }
};

Sentry.init({
  dsn: "https://17d03841e2244d53abdbe587434efd5c@glitchtip.celeswuff.science/1",
});

(document.getElementById("version") as HTMLSpanElement).innerText = " · v" + VERSION;

// 检测蓝牙支持并显示状态
async function checkBluetoothStatus() {
  const statusEl = document.getElementById("bluetooth-status");
  if (!statusEl) {
    console.log("未找到蓝牙状态元素，将重试...");
    setTimeout(checkBluetoothStatus, 200);
    return;
  }

  console.log("开始检测蓝牙支持...");
  
  try {
    // 更严格的蓝牙检测：不仅检查API存在，还要测试实际可用性
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      statusEl.innerHTML = "❌ 浏览器不支持蓝牙 API";
      statusEl.style.color = "rgba(255, 99, 71, 0.9)";
      console.log("蓝牙支持检测完成：不支持（API不存在）");
      return;
    }

    // 测试蓝牙API是否真正可用
    const availability = await navigator.bluetooth.getAvailability();
    
    if (availability) {
      statusEl.innerHTML = "✅ 蓝牙功能可用";
      statusEl.style.color = "rgba(144, 238, 144, 0.9)";
      console.log("蓝牙支持检测完成：可用");
    } else {
      statusEl.innerHTML = "⚠️ 蓝牙硬件不可用或未开启";
      statusEl.style.color = "rgba(255, 215, 0, 0.9)";
      console.log("蓝牙支持检测完成：硬件不可用");
    }
  } catch (error) {
    // 如果 getAvailability 不支持，至少确认API存在
    if (navigator.bluetooth) {
      statusEl.innerHTML = "⚠️ 浏览器支持蓝牙，但无法检测硬件状态";
      statusEl.style.color = "rgba(255, 215, 0, 0.9)";
      console.log("蓝牙支持检测完成：API存在但无法检测硬件");
    } else {
      statusEl.innerHTML = "❌ 蓝牙检测出错";
      statusEl.style.color = "rgba(255, 99, 71, 0.9)";
      console.error("蓝牙检测错误:", error);
    }
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
  
  // 执行蓝牙检测
  checkBluetoothStatus();
  
  // 绑定按钮事件 - 使用最可靠的方法
  const mainButton = document.getElementById("main-button") as HTMLButtonElement;
  if (mainButton) {
    console.log("✅ 找到按钮元素:", mainButton);
    console.log("✅ 按钮当前disabled状态:", mainButton.disabled);
    console.log("✅ 按钮当前style:", mainButton.style.cssText);
    
    // 强制确保按钮可点击
    mainButton.disabled = false;
    mainButton.style.pointerEvents = "auto !important";
    mainButton.style.cursor = "pointer !important";
    mainButton.style.zIndex = "9999";
    
    // 🔥 多重事件绑定确保100%可靠
    const clickHandler = function(event: Event) {
      console.log("� 按钮被点击！事件类型:", event.type);
      event.preventDefault();
      event.stopPropagation();
      
      try {
        // 直接调用蓝牙函数而不是通过导入
        (window as any).startWaterController();
      } catch (error) {
        console.error("按钮点击处理出错:", error);
        // 备用方案
        handleButtonClick();
      }
    };
    
    // 三重保险：onclick + addEventListener + 直接绑定
    mainButton.onclick = clickHandler;
    mainButton.addEventListener("click", clickHandler, { capture: true });
    mainButton.addEventListener("mousedown", clickHandler, { capture: true });
    
    console.log("按钮事件已绑定（使用onclick）");
  } else {
    console.error("❌ 未找到主按钮元素！");
  }
  
  // 🆕 绑定清除配对设备按钮 - 100%可靠版本
  const clearPairingButton = document.getElementById("clear-pairing-button") as HTMLButtonElement;
  if (clearPairingButton) {
    console.log("✅ 找到清除配对按钮:", clearPairingButton);
    
    // 确保按钮可点击
    clearPairingButton.disabled = false;
    clearPairingButton.style.pointerEvents = "auto !important";
    clearPairingButton.style.cursor = "pointer !important";
    
    const clearHandler = async function(event: Event) {
      console.log("🧹 清除配对按钮被点击！");
      event.preventDefault();
      event.stopPropagation();
      
      try {
        if (!navigator.bluetooth || !navigator.bluetooth.getDevices) {
          alert("您的浏览器不支持获取已配对设备");
          return;
        }
        
        const devices = await navigator.bluetooth.getDevices();
        console.log("已配对设备:", devices);
        
        if (devices.length === 0) {
          alert("没有已配对的蓝牙设备");
          return;
        }
        
        let clearedCount = 0;
        for (const device of devices) {
          if (device.forget) {
            await device.forget();
            clearedCount++;
            console.log("已清除设备:", device.name || device.id);
          }
        }
        
        if (clearedCount > 0) {
          alert(`已清除 ${clearedCount} 个已配对设备\n页面将刷新以应用更改`);
          window.location.reload();
        } else {
          alert("浏览器不支持清除配对设备");
        }
      } catch (error) {
        console.error("清除配对设备时出错:", error);
        alert("清除配对设备失败: " + (error as Error).message);
      }
    };
    
    // 多重事件绑定确保可靠性
    clearPairingButton.onclick = clearHandler;
    clearPairingButton.addEventListener("click", clearHandler, { capture: true });
    console.log("✅ 清除配对按钮事件已绑定（多重保险）");
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