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
  console.log("🧹 全局函数被调用：清除配对设备 - 增强版");
  
  try {
    // 详细的浏览器兼容性检查
    if (!navigator.bluetooth) {
      const message = `❌ 您的浏览器不支持Web Bluetooth API

🔧 解决方案：
1️⃣ 使用Chrome 56+、Edge 79+或Opera 43+
2️⃣ 确保网站使用HTTPS协议访问
3️⃣ 检查地址栏是否显示🔒安全连接

📋 当前状态：
• 浏览器：${navigator.userAgent.split(' ')[0]}
• 协议：${location.protocol}
• 域名：${location.hostname}`;
      
      alert(message);
      return;
    }

    if (!navigator.bluetooth.getDevices) {
      const message = `⚠️ 您的Chrome浏览器需要启用实验性功能

🔧 启用步骤：
1️⃣ 在地址栏输入：chrome://flags/
2️⃣ 搜索：Experimental Web Platform features  
3️⃣ 设置为：Enabled
4️⃣ 重启Chrome浏览器

🆘 备用方案：
• 手动清除：chrome://bluetooth-internals/
• 系统设置：Windows设置 > 蓝牙和其他设备`;
      
      alert(message);
      
      // 提供直接跳转选项
      if (confirm("💡 是否打开Chrome蓝牙调试页面？")) {
        try {
          window.open('chrome://bluetooth-internals/', '_blank');
        } catch(e) {
          console.log("无法打开Chrome内部页面，用户需要手动访问");
        }
      }
      return;
    }
    
    console.log("✅ 浏览器支持检查通过，开始获取设备列表...");
    
    const devices = await navigator.bluetooth.getDevices();
    console.log("📱 已配对设备列表:", devices);
    console.log(`📊 设备数量: ${devices.length}`);
    
    if (devices.length === 0) {
      const message = `✅ 当前没有已配对的蓝牙设备

🔍 如果仍有连接问题，请尝试：
• 重启浏览器并重新访问此页面
• 清除浏览器缓存和Cookie
• 关闭蓝牙适配器，等待5秒后重新打开
• 重启电脑的蓝牙服务`;
      
      alert(message);
      return;
    }
    
    // 显示设备信息并确认清除
    const deviceNames = devices.map(d => d.name || d.id || '未知设备').join('\n• ');
    const confirmMessage = `🔍 找到 ${devices.length} 个已配对设备：

• ${deviceNames}

⚠️ 确定要清除这些设备吗？
清除后需要重新配对才能连接。`;
    
    if (!confirm(confirmMessage)) {
      console.log("用户取消了清除操作");
      return;
    }
    
    let clearedCount = 0;
    let failedDevices: string[] = [];
    
    // 逐个清除设备
    for (const device of devices) {
      try {
        const deviceName = device.name || device.id || '未知设备';
        console.log(`🗑️ 正在清除设备: ${deviceName}`);
        
        if (device.forget && typeof device.forget === 'function') {
          await device.forget();
          clearedCount++;
          console.log(`✅ 已清除设备: ${deviceName}`);
        } else {
          console.log(`⚠️ 设备不支持forget方法: ${deviceName}`);
          failedDevices.push(deviceName);
        }
      } catch (deviceError) {
        const deviceName = device.name || device.id || '未知设备';
        console.error(`❌ 清除设备失败: ${deviceName}`, deviceError);
        failedDevices.push(deviceName);
      }
    }
    
    // 显示详细的清除结果
    let resultMessage = '';
    
    if (clearedCount > 0) {
      resultMessage = `🎉 成功清除 ${clearedCount} 个蓝牙设备！`;
      
      if (failedDevices.length > 0) {
        resultMessage += `\n\n⚠️ ${failedDevices.length} 个设备清除失败：
• ${failedDevices.join('\n• ')}

💡 手动清除方法：
1️⃣ 系统设置 → 蓝牙和其他设备
2️⃣ 找到对应设备并点击"移除"`;
      }
      
      resultMessage += '\n\n🔄 页面将刷新以应用更改...';
      alert(resultMessage);
      
      // 延迟刷新，让用户看到消息
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } else {
      resultMessage = `❌ 无法清除任何设备

🔧 可能的原因：
• 浏览器安全限制
• 设备被其他程序占用
• 蓝牙驱动程序问题

💡 解决方案：
1️⃣ 关闭所有蓝牙相关程序
2️⃣ 手动在系统设置中清除
3️⃣ 重启蓝牙适配器`;
      
      alert(resultMessage);
    }
    
  } catch (error) {
    console.error("❌ 清除配对设备过程中发生错误:", error);
    
    let errorMessage = '❌ 清除配对设备失败\n\n';
    const errorStr = (error as Error).message || String(error);
    
    if (errorStr.includes('not allowed') || errorStr.includes('denied')) {
      errorMessage += `🚫 权限被拒绝

🔧 解决方法：
1️⃣ 刷新页面并重试
2️⃣ 检查浏览器权限设置
3️⃣ 确保使用HTTPS访问
4️⃣ 尝试无痕模式访问`;
      
    } else if (errorStr.includes('not supported') || errorStr.includes('undefined')) {
      errorMessage += `⚠️ 浏览器不支持此功能

🔧 解决方法：
1️⃣ 更新Chrome到最新版本
2️⃣ 启用实验性Web平台功能
3️⃣ 使用支持的浏览器版本`;
      
    } else if (errorStr.includes('timeout') || errorStr.includes('time')) {
      errorMessage += `⏱️ 操作超时

🔧 解决方法：
1️⃣ 检查蓝牙适配器状态
2️⃣ 重启蓝牙服务
3️⃣ 减少干扰后重试`;
      
    } else {
      errorMessage += `🐛 未知错误：${errorStr}

🔧 通用解决方法：
1️⃣ 刷新页面重试
2️⃣ 重启浏览器
3️⃣ 手动清除蓝牙设备
4️⃣ 检查控制台详细错误信息`;
    }
    
    alert(errorMessage);
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
  
  // 🆕 绑定清除配对设备按钮 - 使用全局函数，避免重复逻辑
  const clearPairingButton = document.getElementById("clear-pairing-button") as HTMLButtonElement;
  if (clearPairingButton) {
    console.log("✅ 找到清除配对按钮:", clearPairingButton);
    
    // 确保按钮可点击
    clearPairingButton.disabled = false;
    clearPairingButton.style.pointerEvents = "auto !important";
    clearPairingButton.style.cursor = "pointer !important";
    clearPairingButton.style.zIndex = "9999";
    
    const clearHandler = async function(event: Event) {
      console.log("🧹 清除配对按钮被点击！事件类型:", event.type);
      event.preventDefault();
      event.stopPropagation();
      
      try {
        // 调用已定义的全局函数
        await (window as any).clearPairedDevices();
      } catch (error) {
        console.error("调用清除配对设备函数出错:", error);
        alert("清除配对设备功能暂时不可用，请刷新页面重试");
      }
    };
    
    // 三重事件绑定确保可靠性
    clearPairingButton.onclick = clearHandler;
    clearPairingButton.addEventListener("click", clearHandler, { capture: true });
    clearPairingButton.addEventListener("mousedown", clearHandler, { capture: true });
    console.log("✅ 清除配对按钮事件已绑定（三重保险）");
  }
  
  // 🚀 解决"安装按钮显示与功能按钮工作相关性"问题
  // 强制确保所有按钮在所有状态下都能工作
  setTimeout(() => {
    console.log("🔧 执行按钮状态强化修复...");
    
    // 重新检查和强化主按钮
    const mainBtn = document.getElementById("main-button") as HTMLButtonElement;
    if (mainBtn) {
      // 移除任何可能阻止点击的CSS
      mainBtn.style.pointerEvents = "auto";
      mainBtn.style.cursor = "pointer";
      mainBtn.style.userSelect = "none";
      mainBtn.disabled = false;
      
      // 强制覆盖任何CSS隐藏或禁用
      mainBtn.classList.remove("disabled", "hidden");
      
      console.log("✅ 主按钮状态已强化");
    }
    
    // 重新检查和强化清除按钮
    const clearBtn = document.getElementById("clear-pairing-button") as HTMLButtonElement;
    if (clearBtn) {
      clearBtn.style.pointerEvents = "auto";
      clearBtn.style.cursor = "pointer";
      clearBtn.style.userSelect = "none";
      clearBtn.disabled = false;
      clearBtn.classList.remove("disabled", "hidden");
      
      console.log("✅ 清除配对按钮状态已强化");
    }
    
    // 🆕 检查并修复安装按钮相关性问题
    const installBtn = document.getElementById("install-button");
    if (installBtn) {
      console.log("🔍 发现安装按钮存在，状态:", {
        display: getComputedStyle(installBtn).display,
        visibility: getComputedStyle(installBtn).visibility,
        disabled: (installBtn as HTMLButtonElement).disabled
      });
      
      // 确保安装按钮不影响其他按钮的功能
      installBtn.style.zIndex = "1";
    } else {
      console.log("🔍 未发现安装按钮，这可能是某些设备上按钮不工作的原因");
    }
    
    // 全局强制修复任何CSS或JavaScript干扰
    document.body.style.pointerEvents = "auto";
    
  }, 500); // 延迟500ms确保所有元素都已加载
  
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