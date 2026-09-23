import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { I18nProvider, useI18n } from "@/i18n/I18nContext";
import { LanguageOnboarding } from "@/pages/LanguageOnboarding";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { runStartup } from "@/lib/startup";
import { isNativePlatform } from "@/services/platform.service";
import { useLocation, useNavigate } from "@/lib/router-compat";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-base-50">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-base-50">Page not found</h2>
        <p className="mt-2 text-sm text-base-300">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-base-950 transition-colors hover:bg-accent-400"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-base-50">This page didn't load</h1>
        <p className="mt-2 text-sm text-base-300">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-base-950 transition-colors hover:bg-accent-400"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-base-700 bg-base-900 px-4 py-2 text-sm font-medium text-base-100 transition-colors hover:bg-base-800"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, viewport-fit=cover",
      },
      { title: "HomeLab Architect — Design it before you buy it." },
      {
        name: "description",
        content: "Design and understand your HomeLab before you buy it.",
      },
      { name: "theme-color", content: "#0d9488" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "HomeLab Architect" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/icon.svg" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppRoutes() {
  const { hasOnboarded, hydrated } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  useAndroidBackButton();

  useEffect(() => {
    runStartup();
  }, []);

  useEffect(() => {
    if (hydrated && hasOnboarded && location.pathname === "/" && isNativePlatform()) {
      navigate("/app", { replace: true });
    }
  }, [hasOnboarded, hydrated, location.pathname, navigate]);

  if (hydrated && !hasOnboarded) {
    return <LanguageOnboarding />;
  }

  return <Outlet />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <I18nProvider>
          <AppRoutes />
        </I18nProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
