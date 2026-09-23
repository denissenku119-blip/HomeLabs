/**
 * Resilient boot sequence. Every step is optional: a failing native plugin,
 * a blocked storage API or a missing service worker must never stop the UI
 * from rendering.
 */
import { isPluginAvailable, isNativePlatform, getPlatform } from "@/services/platform.service";
import {
  installGlobalErrorListeners,
  logRuntimeError,
  setStartupStage,
  type StartupStage,
} from "@/lib/runtime-diagnostics";

let started = false;

async function safely(stage: StartupStage, service: string, run: () => Promise<void> | void) {
  setStartupStage(stage);
  try {
    await run();
  } catch (error) {
    logRuntimeError(error, { stage, service });
  }
}

export function runStartup(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  installGlobalErrorListeners();

  void (async () => {
    await safely("platform-detection", "PlatformService", () => {
      document.documentElement.dataset.platform = getPlatform();
      document.documentElement.dataset.runtime = isNativePlatform() ? "native" : "web";
    });

    await safely("storage-initialization", "WebStorage", () => {
      // Touch storage once so a locked/quota-exceeded WebView surfaces here
      // instead of inside a render pass.
      const probe = "__homelab_probe__";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
    });

    await safely("currency-initialization", "CurrencyRegistry", () => {
      // Currency data is static today. Keeping this isolated stage makes future
      // preference migrations unable to block the shell.
    });

    await safely("pwa-initialization", "ServiceWorker", async () => {
      // Capacitor serves bundled assets itself. A service worker is optional and
      // should only be registered by the hosted web application.
      if (isNativePlatform() || !("serviceWorker" in navigator)) return;
      await navigator.serviceWorker.register("/sw.js");
    });

    await safely("currency-initialization", "InstallReferrer", async () => {
      // Optional, best-effort, once per install. Never blocks the app.
      const { captureInstallReferrer } = await import("@/features/referral/installReferrer");
      await captureInstallReferrer();
    });

    if (!isNativePlatform()) {
      setStartupStage("ready");
      return;
    }

    await safely("capacitor-app-initialization", "CapacitorApp", async () => {
      if (!isPluginAvailable("App")) return;
      await import("@capacitor/app");
    });

    await safely("status-bar-initialization", "StatusBar", async () => {
      if (!isPluginAvailable("StatusBar")) return;
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setOverlaysWebView({ overlay: false });
    });

    await safely("splash-screen-initialization", "SplashScreen", async () => {
      if (!isPluginAvailable("SplashScreen")) return;
      const { SplashScreen } = await import("@capacitor/splash-screen");
      await SplashScreen.hide();
    });

    setStartupStage("ready");
  })();
}
