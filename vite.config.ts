// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Emit a static client shell (dist/client/index.html) so the Capacitor
    // Android WebView can boot the app without any server.
    spa: { enabled: true, prerender: { outputPath: "/index.html", crawlLinks: false } },
  },
  vite: {
    optimizeDeps: {
      // Pre-bundle every dependency the app can reach, including the ones that
      // are only discovered once a lazily loaded route renders (report charts,
      // dialogs, icons). Without this, Vite re-optimizes mid-session and the
      // page ends up mixing two dependency builds, which leaves React's hook
      // dispatcher null ("Cannot read properties of null (reading 'useMemo')")
      // and trips the error boundary on an otherwise healthy page.
      include: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client",
        "@tanstack/react-router",
        "@tanstack/react-query",
        "lucide-react",
        "recharts",
        "zod",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
        "date-fns",
        "sonner",
        "@supabase/supabase-js",
        "@capacitor/core",
      ],
    },
  },
});
