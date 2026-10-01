# Final mobile sidebar and scrolling repair

## Scope
Preserve the current HomeLab Architect design and features. Repair only the active app shell, shared sidebar drawer behavior, global mobile scrolling rules, and Android web-asset delivery where the source audit proves a conflict.

## Findings guiding the repair
- The active application is TanStack Start (`src/routes/__root.tsx` → route → page → `AppShell`); this checkout has no `App.tsx`, `BrowserRouter`, `index.css`, or `App.css` to preserve or replace.
- Desktop and mobile already import the same `Sidebar` component, so there is no second source sidebar in `src`. The mobile drawer needs viewport-safe sizing and its own vertical overflow so all current items remain reachable.
- Normal pages should use document scrolling. Nested scrolling should remain only for the fixed desktop workspace, menus, and dialogs that genuinely need it.
- Capacitor points to the flattened `dist` bundle. The native `android/` directory is absent from this checkout, so native sync cannot run unless that existing native project is restored; generating a replacement could overwrite the owner’s icon and splash resources.

## Implementation
1. Keep `Sidebar.tsx` as the single navigation/content source for desktop and mobile, preserving every existing item, translation, icon, route, and Pro action.
2. Make the mobile drawer bounded by the dynamic viewport and independently finger-scrollable, including safe-area handling, while keeping the background locked only while open.
3. Make lock cleanup reliable on close, navigation, unmount, and Android back; preserve the existing overlay-first Android back behavior.
4. Keep one global document scroller for ordinary mobile pages and retain nested scrolling only for the desktop builder workspace and intentionally scrollable panels/dialogs.
5. Build the current source into a fresh flattened `dist` bundle and inspect its asset references. Run native Capacitor sync only if the existing Android project is available; do not recreate it or alter native identity/assets.

## Validation
- Run `npm run typecheck` and `npm run build`.
- Test long and short pages at Android and desktop viewport sizes for vertical scrolling and zero horizontal overflow.
- Open the drawer, verify every required item is present, verify drawer scrolling, close by button/backdrop/navigation/Android-back-equivalent, and confirm page scrolling is restored.
- Run `npx cap sync android` when the native Android project exists; otherwise report the exact missing-project blocker.
