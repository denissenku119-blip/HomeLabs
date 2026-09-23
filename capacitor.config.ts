/* eslint-disable */
// Typed structurally so the config compiles without the optional
// @capacitor/cli dev dependency installed in this checkout.
type CapacitorConfig = Record<string, unknown>;

/**
 * Capacitor configuration for the Android build.
 *
 * `webDir` points at `dist/`, which is produced by `npm run build:mobile`
 * (vite build + scripts/build-mobile.mjs promoting dist/client to dist/).
 *
 * The existing app icon and splash assets in the native project are NOT
 * managed from here — no icon/splash resource generation is configured, so
 * `npx cap sync android` only refreshes web assets and plugins.
 */
const config: CapacitorConfig = {
  appId: 'com.maxjeremy.homelabarchitect',
  appName: 'HomeLab Architect',
  webDir: 'dist',
  android: {
    // Release builds must not allow cleartext HTTP.
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      // The app hides the splash itself once the shell has rendered
      // (see src/lib/startup.ts), so no auto-hide timer here.
      launchAutoHide: false,
      backgroundColor: '#0b0f14',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0b0f14',
      overlaysWebView: false,
    },
  },
};

export default config;
