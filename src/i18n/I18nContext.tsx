import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { TextDirection } from "./types";
import { LANGUAGES, getLanguage, getDefaultLanguage, isRTL } from "./languages";
import { translate, translateVisibleText } from "./translate";
import { logRuntimeError, setStartupStage } from "@/lib/runtime-diagnostics";

const STORAGE_KEY = "homelab-architect:language";
const ONBOARDING_KEY = "homelab-architect:language-onboarded";
const sourceText = new WeakMap<Text, string>();
const sourceAttributes = new WeakMap<Element, Map<string, string>>();

interface I18nContextValue {
  langId: string;
  direction: TextDirection;
  isRTL: boolean;
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLanguage: (langId: string) => void;
  hasOnboarded: boolean;
  hydrated: boolean;
  completeOnboarding: (langId: string) => void;
  availableLanguages: typeof LANGUAGES;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function loadStoredLanguage(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && getLanguage(stored)) return stored;
  } catch {
    // fail silently
  }
  return getDefaultLanguage().id;
}

function loadOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Storage is only available in the browser, so start from defaults and
  // hydrate from localStorage after mount.
  const [langId, setLangIdState] = useState<string>(() => getDefaultLanguage().id);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setStartupStage("language-initialization");
    try {
      setLangIdState(loadStoredLanguage());
      setHasOnboarded(loadOnboarded());
    } catch (error) {
      logRuntimeError(error, { stage: "language-initialization", service: "I18nProvider" });
    } finally {
      setHydrated(true);
    }
  }, []);

  const lang = getLanguage(langId) ?? getDefaultLanguage();
  const direction = lang.direction;
  const rtl = isRTL(langId);

  useEffect(() => {
    document.documentElement.lang = lang.locale;
    document.documentElement.dir = direction;
  }, [lang.locale, direction]);

  useEffect(() => {
    const attributes = ["aria-label", "title", "placeholder"];
    let applying = false;

    const localizeElement = (root: Node) => {
      applying = true;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let node: Node | null = root;
      while (node) {
        if (node instanceof Element) {
          if (node.closest("[data-no-i18n]")) {
            node = walker.nextSibling();
            continue;
          }
          let originals = sourceAttributes.get(node);
          if (!originals) {
            originals = new Map();
            sourceAttributes.set(node, originals);
          }
          for (const attribute of attributes) {
            const current = node.getAttribute(attribute);
            if (current == null) continue;
            if (!originals.has(attribute)) originals.set(attribute, current);
            const source = originals.get(attribute) ?? current;
            const localized = translateVisibleText(source, langId);
            if (current !== localized) node.setAttribute(attribute, localized);
          }
        } else if (node instanceof Text && !node.parentElement?.closest("[data-no-i18n]")) {
          if (!sourceText.has(node)) sourceText.set(node, node.data);
          const source = sourceText.get(node) ?? node.data;
          const localized = translateVisibleText(source, langId);
          if (node.data !== localized) node.data = localized;
        }
        node = walker.nextNode();
      }
      applying = false;
    };

    localizeElement(document.body);
    const observer = new MutationObserver((mutations) => {
      if (applying) return;
      for (const mutation of mutations) {
        if (mutation.type === "characterData" && mutation.target instanceof Text) {
          sourceText.set(mutation.target, mutation.target.data);
          localizeElement(mutation.target);
        } else if (mutation.type === "attributes" && mutation.target instanceof Element) {
          const attribute = mutation.attributeName;
          if (attribute && attributes.includes(attribute)) {
            const current = mutation.target.getAttribute(attribute);
            if (current != null) {
              const originals = sourceAttributes.get(mutation.target) ?? new Map<string, string>();
              originals.set(attribute, current);
              sourceAttributes.set(mutation.target, originals);
            }
          }
          localizeElement(mutation.target);
        } else {
          mutation.addedNodes.forEach(localizeElement);
        }
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributes,
    });
    return () => observer.disconnect();
  }, [langId]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(key, langId, params),
    [langId],
  );

  const setLanguage = useCallback((id: string) => {
    if (!getLanguage(id)) return;
    setLangIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // fail silently
    }
  }, []);

  const completeOnboarding = useCallback((id: string) => {
    if (!getLanguage(id)) return;
    setLangIdState(id);
    setHasOnboarded(true);
    try {
      localStorage.setItem(STORAGE_KEY, id);
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      // fail silently
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      langId,
      direction,
      isRTL: rtl,
      locale: lang.locale,
      t,
      setLanguage,
      hasOnboarded,
      hydrated,
      completeOnboarding,
      availableLanguages: LANGUAGES,
    }),
    [
      langId,
      direction,
      rtl,
      lang.locale,
      t,
      setLanguage,
      hasOnboarded,
      hydrated,
      completeOnboarding,
    ],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
