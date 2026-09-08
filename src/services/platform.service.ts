type Platform = 'web' | 'android' | 'ios';

function detectPlatform(): Platform {
  if (typeof window !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
  }
  return 'web';
}

function detectNative(): boolean {
  return typeof window !== 'undefined' &&
    '__ Capacitor' in window;
}

export const platform: Platform = detectPlatform();
export const isNative: boolean = detectNative();
export const isMobile: boolean = platform !== 'web';
export const isAndroid: boolean = platform === 'android';
export const isIOS: boolean = platform === 'ios';

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
  const webShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  return {
    nativeShare: isNative,
    webShare,
    fileSystem: isNative,
    haptics: isNative,
    statusBar: isNative,
    splashScreen: isNative,
    backButton: isAndroid,
  };
}
