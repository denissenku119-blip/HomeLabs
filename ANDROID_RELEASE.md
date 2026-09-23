# Android / Google Play release guide

This app is **not** published to Google Play and is not connected to any store
account. This document describes the normal workflow to produce a release
build from this repository.

## Identity (do not change)

| Item | Value | Source of truth |
| --- | --- | --- |
| Package ID / applicationId | `com.maxjeremy.homelabarchitect` | `src/config/app.ts`, `capacitor.config.ts` |
| App name | `HomeLab Architect` | `src/config/app.ts`, `capacitor.config.ts` |
| Version name | `0.9.0` | `src/config/app.ts` (`APP_VERSION`) |
| Version code | `1` | `src/config/app.ts` (`APP_VERSION_CODE`) |

Bump `APP_VERSION` and `APP_VERSION_CODE` in `src/config/app.ts` for every
Play upload, and mirror them in `android/app/build.gradle`
(`versionName` / `versionCode`). Play rejects a re-used version code.

## 1. Build the web assets

```bash
npm run build:mobile
```

`vite build` emits `dist/client` (static, prerendered `index.html`) and
`dist/server` (Nitro SSR output, useless in a WebView).
`scripts/build-mobile.mjs` promotes `dist/client/*` to `dist/` and deletes the
server output, which is what `webDir: 'dist'` in `capacitor.config.ts`
expects.

## 2. Native project

The `android/` native project is **not** part of this checkout. If you have it
in your local Capacitor workspace, copy `capacitor.config.ts` next to it and
run:

```bash
npm install @capacitor/cli --save-dev   # only if the CLI is missing
npx cap sync android
```

If you do not have `android/` yet, create it once with `npx cap add android`
and then restore your existing launcher icon, adaptive icon and splash
resources into `android/app/src/main/res/` — `cap add` writes Capacitor
placeholder assets that must not be shipped.

`cap sync` copies web assets and plugin code only; it does not overwrite icons
or splash drawables.

## 3. Permissions

The app is offline-first: projects, settings and feedback are stored on the
device and nothing is uploaded. The only permission the WebView needs is:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Remove anything else the template added (`ACCESS_NETWORK_STATE` is optional
and only needed if you keep the online/offline indicator accurate on Android;
no camera, location, storage or contacts permission is used).

## 4. Release build configuration

In `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.maxjeremy.homelabarchitect"
        versionCode 1
        versionName "0.9.0"
    }
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

## 5. Signing

Create an upload keystore once and keep it out of version control:

```bash
keytool -genkey -v -keystore homelab-upload.keystore \
  -alias homelab -keyalg RSA -keysize 2048 -validity 10000
```

Put the credentials in `android/keystore.properties` (git-ignored, never
committed):

```
storeFile=../homelab-upload.keystore
storePassword=…
keyAlias=homelab
keyPassword=…
```

and load it in `build.gradle` via a `signingConfigs.release` block that reads
that file. Enrol in Play App Signing when creating the Play Console entry.

## 6. Produce the bundle

```bash
cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```

Upload the `.aab` in the Play Console.

## 7. Play listing content

The store listing requires a publicly reachable privacy policy URL. The app
serves one at `/privacy` (plus `/terms` and `/disclaimer`) on the deployed web
build — use that URL in the Data safety and listing sections. Data safety
answers for this build: no data collected, no data shared, data stored on
device only.
