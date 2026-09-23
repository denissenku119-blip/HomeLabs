import { getPlatform, isNativePlatform } from "@/services/platform.service";

export type StartupStage =
  | "react-render"
  | "platform-detection"
  | "storage-initialization"
  | "language-initialization"
  | "currency-initialization"
  | "pwa-initialization"
  | "capacitor-app-initialization"
  | "status-bar-initialization"
  | "splash-screen-initialization"
  | "ready";

let currentStage: StartupStage = "react-render";

export function setStartupStage(stage: StartupStage): void {
  currentStage = stage;
}

export function getStartupStage(): StartupStage {
  return currentStage;
}

export function logRuntimeError(
  error: unknown,
  context: { stage?: StartupStage; service?: string; componentStack?: string } = {},
): void {
  const normalized = error instanceof Error ? error : new Error(String(error));
  let platform = "unknown";
  let native = false;

  try {
    platform = getPlatform();
    native = isNativePlatform();
  } catch {
    // Diagnostics must never create another startup failure.
  }

  console.error("[HomeLab runtime error]", {
    name: normalized.name,
    message: normalized.message,
    stack: normalized.stack,
    componentStack: context.componentStack,
    initializationStage: context.stage ?? currentStage,
    service: context.service ?? "unknown",
    platform,
    native,
  });
}

let listenersInstalled = false;

/**
 * Surfaces exceptions that never reach a React boundary (async work, native
 * bridge callbacks, rejected plugin promises) so an Android WebView session
 * still produces a readable console record.
 */
export function installGlobalErrorListeners(): void {
  if (listenersInstalled || typeof window === "undefined") return;
  listenersInstalled = true;

  window.addEventListener("error", (event) => {
    logRuntimeError(event.error ?? event.message, { service: "window.onerror" });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logRuntimeError(event.reason, { service: "window.unhandledrejection" });
  });
}
