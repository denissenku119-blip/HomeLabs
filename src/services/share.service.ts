import { isNative, getCapabilities } from './platform.service';

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  files?: { name: string; mimeType: string; data: string }[];
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'web' | 'clipboard' | 'none';
  message?: string;
}

export async function shareContent(options: ShareOptions): Promise<ShareResult> {
  const caps = getCapabilities();

  if (isNative && caps.nativeShare) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.title,
      });
      return { success: true, method: 'native' };
    } catch {
      // fall through to web share
    }
  }

  if (caps.webShare) {
    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url,
      });
      return { success: true, method: 'web' };
    } catch {
      // user cancelled or share failed, fall through to clipboard
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      const text = [options.title, options.text, options.url].filter(Boolean).join('\n');
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard', message: 'Copied to clipboard' };
    } catch {
      // clipboard also failed
    }
  }

  return { success: false, method: 'none', message: 'Sharing not available' };
}
