export const registerServiceWorker = () => {
  if (navigator.serviceWorker && !navigator.serviceWorker.controller && location.protocol === "https:") {
    navigator.serviceWorker.register("serviceworker.js");
  }
};

// pwa install prompt - 修复版本，默认显示安装按钮
export const setupInstallButton = () => {
  const installButton = document.getElementById("install-button") as HTMLButtonElement;
  if (!installButton) {
    console.warn("安装按钮未找到");
    return;
  }

  // 🔥 默认显示安装按钮（基于用户反馈，之前能正常工作时按钮是可见的）
  installButton.hidden = false;
  console.log("✅ 安装按钮已显示");

  window.addEventListener("beforeinstallprompt", (event) => {
    console.log("🚀 PWA安装提示事件触发");
    event.preventDefault();
    (window as any).deferredPrompt = event;
    installButton.hidden = false;
    installButton.style.display = "block";
  });

  installButton.addEventListener("click", async () => {
    console.log("🔘 安装按钮被点击");
    const promptEvent = (window as any).deferredPrompt;
    
    if (!promptEvent) {
      console.log("⚠️ 没有PWA安装提示事件，可能已经安装或不支持");
      alert("该应用可能已经安装，或者您的浏览器不支持PWA安装功能");
      return;
    }

    try {
      promptEvent.prompt();
      const result = await promptEvent.userChoice;
      console.log("📱 PWA安装选择:", result.outcome);
      
      (window as any).deferredPrompt = null;
      if (result.outcome === 'accepted') {
        installButton.hidden = true;
      }
    } catch (error) {
      console.error("PWA安装出错:", error);
    }
  });

  window.addEventListener("appinstalled", () => {
    console.log("🎉 PWA已成功安装");
    (window as any).deferredPrompt = null;
    installButton.hidden = true;
  });
};

// auto resize for desktop
export const resizeWindow = () => {
  window.resizeTo(538, 334);
};
