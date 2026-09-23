type Platform = "web" | "android" | "ios";

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  isPluginAvailable?: (name: string) => boolean;
  platform?: string;
}

function getCapacitor(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  return cap && typeof cap === "object" ? cap : undefined;
}

/**
 * Runtime check. Capacitor injects its bridge into the WebView before app code
 * runs, but it must never be assumed to exist: a Capacitor-built bundle can be
 * served on the web, and plugins can be missing from a given native build.
 */
export function isNativePlatform(): boolean {
  try {
    const cap = getCapacitor();
    if (!cap) return false;
    if (typeof cap.isNativePlatform === "function") return cap.isNativePlatform() === true;
    const name = typeof cap.getPlatform === "function" ? cap.getPlatform() : cap.platform;
    return name === "android" || name === "ios";
  } catch {
    return false;
  }
}

export function isPluginAvailable(name: string): boolean {
  try {
    const cap = getCapacitor();
    if (!cap || !isNativePlatform()) return false;
    if (typeof cap.isPluginAvailable !== "function") return true;
    return cap.isPluginAvailable(name) === true;
  } catch {
    return false;
  }
}

export function getPlatform(): Platform {
  try {
    const cap = getCapacitor();
    const native = typeof cap?.getPlatform === "function" ? cap.getPlatform() : cap?.platform;
    if (native === "android") return "android";
    if (native === "ios") return "ios";

    if (typeof navigator !== "undefined" && navigator.userAgent) {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes("android")) return "android";
      if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return "ios";
    }
  } catch {
    // fall through to web
  }
  return "web";
}

export function isMobilePlatform(): boolean {
  return getPlatform() !== "web";
}

export function isAndroidPlatform(): boolean {
  return getPlatform() === "android";
}

export function isIOSPlatform(): boolean {
  return getPlatform() === "ios";
}

export interface PlatformCapabilities {
  nativeShare: boolean;
  webShare: boolean;
  fileSystem: boolean;
  haptics: boolean;
  statusBar: boolean;
  splashScreen: boolean;
  backButton: boolean;
}

export function getCapabilities(): PlatformCapabilities {
  let webShare = false;
  try {
    webShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  } catch {
    webShare = false;
  }

  return {
    nativeShare: isPluginAvailable("Share"),
    webShare,
    fileSystem: isPluginAvailable("Filesystem"),
    haptics: isPluginAvailable("Haptics"),
    statusBar: isPluginAvailable("StatusBar"),
    splashScreen: isPluginAvailable("SplashScreen"),
    backButton: isAndroidPlatform() && isNativePlatform(),
  };
}
