import type { CapacitorConfig } from '@capacitor/cli';
import { APP_NAME, APP_IDENTIFIER, APP_VERSION, APP_VERSION_CODE } from './src/config/app';

const config: CapacitorConfig = {
  appId: APP_IDENTIFIER,
  appName: APP_NAME,
  webDir: 'dist',
  version: APP_VERSION,
  versionCode: APP_VERSION_CODE,
  backgroundColor: '#0a0c10',
  android: {
    backgroundColor: '#0a0c10',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    backgroundColor: '#0a0c10',
    contentInset: 'always',
    limitsNavigationsToAppBoundDomains: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#0a0c10',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0c10',
      overlaysWebView: false,
    },
  },
};

export default config;
