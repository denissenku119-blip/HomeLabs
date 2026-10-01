# Android UI parity and mobile scrolling repair

## Scope
Preserve the current HomeLab Architect design and desktop behavior. Change only the active shell, global scrolling rules, and Android web-asset pipeline where the audit proves a conflict.

## Findings guiding the repair
- There is no `App.tsx`; the active application tree is TanStack Start: `src/routes/__root.tsx` → route page → `AppShell`/public page container. No duplicate legacy page tree is present in `src`.
- Capacitor points to the generated `dist` folder, and `build:mobile` promotes the newest `dist/client` output there. The native `android/` project is not present in this checkout, so native resource copying cannot be run here without recreating Android and replacing the owner's existing native assets.
- Ordinary pages already use document scrolling, but the workspace mixes mobile document scrolling with unresolved `h-full`, a fixed minimum workspace height, and desktop-oriented nested overflow rules. This is the likely physical-WebView inconsistency.
- The web service worker uses stale-while-revalidate for scripts/styles. It is skipped inside Capacitor, but older hosted/PWA installs can briefly display old bundles.

## Implementation
1. Make the active app shell the single scrolling owner for ordinary mobile pages while preserving the desktop workspace's fixed-height panels.
2. Remove the workspace's mobile dependence on unresolved percentage height and constrain nested scrolling to desktop or intentionally scrollable panels only.
3. Keep canvas `touch-action: none` because it is the interactive pan/drag surface; ensure surrounding page content remains vertically scrollable.
4. Make generated mobile assets deterministic by clearing prior staging/output before promoting the fresh client bundle; do not create a replacement Android project or touch icons, splash, package ID, routes, pages, or features.
5. Prevent old hosted assets from winning over current hashed scripts/styles while retaining offline shell behavior.

## Validation
- Run the project typecheck command available in the toolchain and the production build.
- Run `build:mobile`, inspect `dist/index.html` and its referenced current assets, and confirm no server output or stale staging remains.
- Verify representative long pages and the workspace at desktop and Android phone viewport sizes, including drawer open/close and vertical swipe scrolling.
- If the native Android project remains absent, report native `cap sync android` as externally blocked rather than generating a new project with default assets.
