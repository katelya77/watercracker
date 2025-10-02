import "./styles.css";
import "./writeValueLogging";
import { handleButtonClick } from "./bluetooth";
import { registerServiceWorker, resizeWindow, setupInstallButton } from "./pwaHelper";
import { ParticleSystem } from "./particles";

(document.getElementById("version") as HTMLSpanElement).innerText = " · v" + VERSION;

// 改进的蓝牙支持检测
function checkBluetoothSupport() {
  // 检查是否在HTTPS环境或本地开发环境
  const isSecureContext = window.isSecureContext || 
                         location.protocol === 'https:' || 
                         location.hostname === 'localhost' ||
                         location.hostname === '127.0.0.1';
  
  // 检查浏览器是否支持蓝牙API
  const hasBluetoothAPI = 'bluetooth' in navigator && typeof navigator.bluetooth !== 'undefined';
  
  // 检查是否是支持的浏览器
  const userAgent = navigator.userAgent.toLowerCase();
  const isSupportedBrowser = 
    (userAgent.includes('chrome') && !userAgent.includes('edg')) || // Chrome但不是Edge
    userAgent.includes('edg') || // Edge
    userAgent.includes('opera') ||
    userAgent.includes('opr'); // Opera

  console.log('蓝牙支持检测:', {
    isSecureContext,
    hasBluetoothAPI,
    isSupportedBrowser,
    userAgent: navigator.userAgent,
    protocol: location.protocol,
    hostname: location.hostname
  });

  return isSecureContext && hasBluetoothAPI && isSupportedBrowser;
}

if (!checkBluetoothSupport()) {
  (document.querySelector(".supported") as HTMLElement).style.display = "none";
  (document.querySelector(".unsupported") as HTMLElement).style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  const mainButton = document.getElementById("main-button") as HTMLButtonElement;
  mainButton.addEventListener("click", handleButtonClick);
  
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
