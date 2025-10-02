import "./styles.css";
import "./writeValueLogging";
import { handleButtonClick } from "./bluetooth";
import { registerServiceWorker, resizeWindow, setupInstallButton } from "./pwaHelper";
import { ParticleSystem } from "./particles";

(document.getElementById("version") as HTMLSpanElement).innerText = " · v" + VERSION;

// 简化的蓝牙支持检测 - 优先展示主界面
function checkBluetoothSupport() {
  try {
    // 基本检查：确保navigator对象存在
    if (!navigator) return false;
    
    // 检查蓝牙API是否存在
    const hasBluetoothAPI = 'bluetooth' in navigator;
    
    // 如果没有蓝牙API，但是在开发环境，仍然允许展示界面
    const isLocalDev = location.hostname === 'localhost' || 
                      location.hostname === '127.0.0.1' ||
                      location.protocol === 'file:';
    
    // 宽松的浏览器检测
    const userAgent = navigator.userAgent.toLowerCase();
    const isModernBrowser = 
      userAgent.includes('chrome') || 
      userAgent.includes('edge') || 
      userAgent.includes('edg') ||
      userAgent.includes('opera') ||
      userAgent.includes('firefox');

    console.log('蓝牙支持检测:', {
      hasBluetoothAPI,
      isLocalDev,
      isModernBrowser,
      userAgent: navigator.userAgent,
      protocol: location.protocol,
      hostname: location.hostname,
      isSecureContext: window.isSecureContext
    });

    // 优先显示主界面 - 只有在明确不支持时才隐藏
    return hasBluetoothAPI || isLocalDev || isModernBrowser;
  } catch (error) {
    console.error('蓝牙检测出错:', error);
    // 出错时默认显示主界面
    return true;
  }
}

// 检查URL参数，如果有force=true就强制显示
const urlParams = new URLSearchParams(window.location.search);
const forceShow = urlParams.get('force') === 'true';

// 默认显示主界面
function forceShowMainInterface() {
  const supportedEl = document.querySelector(".supported") as HTMLElement;
  const unsupportedEl = document.querySelector(".unsupported") as HTMLElement;
  
  if (supportedEl) supportedEl.style.display = "flex";
  if (unsupportedEl) unsupportedEl.style.display = "none";
  
  console.log('强制显示主界面');
}

// 页面加载时就立即显示主界面
forceShowMainInterface();

document.addEventListener("DOMContentLoaded", () => {
  // 再次确保显示主界面
  forceShowMainInterface();
  
  // 如果URL中有force参数或者检测通过，就显示主界面
  if (forceShow || checkBluetoothSupport()) {
    console.log('显示主界面 - forceShow:', forceShow, 'checkBluetoothSupport:', checkBluetoothSupport());
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const mainButton = document.getElementById("main-button") as HTMLButtonElement;
  if (mainButton) {
    mainButton.addEventListener("click", handleButtonClick);
  }
  
  // 添加"仍要使用"按钮的事件监听器
  const forceShowButton = document.getElementById("force-show-main") as HTMLButtonElement;
  if (forceShowButton) {
    forceShowButton.addEventListener("click", () => {
      (document.querySelector(".supported") as HTMLElement).style.display = "flex";
      (document.querySelector(".unsupported") as HTMLElement).style.display = "none";
    });
  }
  
  // 添加页面加载动画
  addLoadingAnimation();
  
  // 添加鼠标跟随效果
  addMouseFollowEffect();
  
  // 初始化状态指示器
  updateStatusIndicator('ready', '就绪');
});

// 页面加载动画
function addLoadingAnimation() {
  const main = document.querySelector('.main.supported') as HTMLElement;
  if (main) {
    main.style.opacity = '0';
    main.style.transform = 'translate(-50%, -50%) scale(0.9)';
    main.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    
    setTimeout(() => {
      main.style.opacity = '1';
      main.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);
  }
  
  // 初始化粒子系统
  setTimeout(() => {
    new ParticleSystem();
  }, 500);
}

// 鼠标跟随光效
function addMouseFollowEffect() {
  const cursor = document.createElement('div');
  cursor.className = 'cursor-glow';
  cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.1s ease;
  `;
  document.body.appendChild(cursor);
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
  });
}

// 更新状态指示器
function updateStatusIndicator(status: 'ready' | 'connecting' | 'connected' | 'error', text: string) {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  
  if (statusDot && statusText) {
    // 清除所有状态类
    statusDot.className = 'status-dot';
    
    // 添加新状态类
    if (status === 'connecting') {
      statusDot.classList.add('connecting');
    } else if (status === 'error') {
      statusDot.classList.add('error');
    }
    
    // 更新文本
    statusText.textContent = text;
  }
}

// PWA
registerServiceWorker();
setupInstallButton();
resizeWindow();
