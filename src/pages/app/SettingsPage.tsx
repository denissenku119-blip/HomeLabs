import { useState, useEffect } from "react";
import { Save, Globe, ChevronRight, Crown, Compass, LifeBuoy, Share2 } from "lucide-react";
import { ShareAppButton } from "@/components/ShareAppButton";
import { Link } from "@/lib/router-compat";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CurrencySelect } from "@/components/CurrencySelect";
import { LanguagePicker } from "@/components/LanguagePicker";
import { useI18n } from "@/i18n/I18nContext";
import { getLanguage } from "@/i18n/languages";
import { UpgradeModal } from "@/components/pro/UpgradePanel";
import { openGuide } from "@/features/guide/guideStore";
import {
  usePlan,
  FREE_BENEFITS,
  PRO_BENEFITS,
} from "@/features/entitlements/plan";

const SUPPORT_LINKS = [
  {
    to: "/feedback",
    label: "navigation.feedback",
    description: "settings.feedbackDesc",
  },
  { to: "/about", label: "settings.about", description: "settings.aboutDesc" },
  { to: "/privacy", label: "settings.privacy", description: "settings.privacyDesc" },
  { to: "/terms", label: "settings.terms", description: "settings.termsDesc" },
  { to: "/disclaimer", label: "settings.disclaimer", description: "settings.disclaimerDesc" },
];

const voltageOptions = [
  { value: "120", label: "settings.voltage120" },
  { value: "230", label: "settings.voltage230" },
];

const SETTINGS_KEY = "homelab-architect:settings";
const DEFAULT_SETTINGS: AppSettings = {
  defaultCurrency: "USD",
  defaultVoltage: "120",
  electricityRate: "0.15",
};

interface AppSettings {
  defaultCurrency: string;
  defaultVoltage: string;
  electricityRate: string;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const value = parsed as Record<string, unknown>;
        return {
          defaultCurrency:
            typeof value.defaultCurrency === "string"
              ? value.defaultCurrency
              : DEFAULT_SETTINGS.defaultCurrency,
          defaultVoltage:
            typeof value.defaultVoltage === "string"
              ? value.defaultVoltage
              : DEFAULT_SETTINGS.defaultVoltage,
          electricityRate:
            typeof value.electricityRate === "string"
              ? value.electricityRate
              : DEFAULT_SETTINGS.electricityRate,
        };
      }
    }
  } catch {
    // fail silently
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // fail silently
  }
}

export function SettingsPage() {
  const { t, langId } = useI18n();
  const [currency, setCurrency] = useState("USD");
  const [voltage, setVoltage] = useState("120");
  const [electricityRate, setElectricityRate] = useState("0.15");
  const [saved, setSaved] = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { isPro, restorePurchase } = usePlan();
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const handleRestore = async () => {
    const result = await restorePurchase();
    if (result.entitled) setRestoreMessage(t("pro.restored"));
    else if (result.billingAvailable)
      setRestoreMessage(t("pro.notFound"));
    else setRestoreMessage(t("pro.unavailable"));
  };

  const currentLang = getLanguage(langId);

  useEffect(() => {
    const s = loadSettings();
    setCurrency(s.defaultCurrency);
    setVoltage(s.defaultVoltage);
    setElectricityRate(s.electricityRate);
  }, []);

  const handleSave = () => {
    saveSettings({
      defaultCurrency: currency,
      defaultVoltage: voltage,
      electricityRate: electricityRate || "0.15",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setCurrency("USD");
    setVoltage("120");
    setElectricityRate("0.15");
  };

  return (
    <AppShell>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <LanguagePicker open={langPickerOpen} onClose={() => setLangPickerOpen(false)} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader title={t("settings.title")} description={t("settings.description")} />

        <div className="mt-8 flex flex-col gap-6">
          {/* Plan */}
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 text-accent" />
              {t("common.plan")}
            </h3>
            <p className="text-sm text-base-200">
              {t("pro.currentPlan", { plan: isPro ? t("common.pro") : t("common.free") })}
            </p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {(isPro ? PRO_BENEFITS : FREE_BENEFITS).map((item, index) => (
                <li key={item} className="text-xs text-base-300">
                  • {t(`${isPro ? "pro.benefit" : "pro.free"}.${index + 1}`)}
                </li>
              ))}
            </ul>
            {!isPro && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <Button onClick={() => setUpgradeOpen(true)} leftIcon={<Crown className="w-4 h-4" />}>
                  {t("pro.upgradePrice")}
                </Button>
                <button
                  type="button"
                  onClick={handleRestore}
                  className="text-2xs text-base-400 hover:text-base-100 transition-colors text-start min-h-[44px]"
                >
                  {t("pro.restore")}
                </button>
              </div>
            )}
            {restoreMessage && (
              <p className="mt-2 text-2xs text-base-300" role="status" aria-live="polite">
                {restoreMessage}
              </p>
            )}
          </Card>

          {/* Share */}
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-accent" />
              {t("settings.shareTitle")}
            </h3>
            <p className="text-sm text-base-200">
              {t("settings.shareBody")}
            </p>
            <ShareAppButton className="mt-3" />
          </Card>

          {/* Guide */}
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-accent" />
              {t("guide.title")}
            </h3>
            <p className="text-sm text-base-200">
              {t("settings.guideBody")}
            </p>
            <Button variant="ghost" className="mt-3" onClick={openGuide}>
              {t("settings.openGuide")}
            </Button>
          </Card>

          {/* Language */}
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              {t("settings.language")}
            </h3>
            <button
              onClick={() => setLangPickerOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-base-850 border border-base-700 hover:border-base-600 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-100">
                  {currentLang?.nativeName ?? "English"}
                </p>
                <p className="text-2xs text-base-400">{currentLang?.englishName}</p>
              </div>
              <span className="text-2xs text-accent font-medium">
                {t("settings.changeLanguage")}
              </span>
              <ChevronRight className="w-4 h-4 text-base-400 rtl:rotate-180" />
            </button>
          </Card>

          {/* Preferences */}
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4">
              {t("settings.preferences")}
            </h3>
            <div className="flex flex-col gap-5">
              <CurrencySelect
                label={t("settings.defaultCurrency")}
                value={currency}
                onChange={setCurrency}
                helperText={t("settings.defaultCurrencyHelper")}
              />
              <Select
                label={t("settings.defaultVoltage")}
                options={voltageOptions.map((option) => ({ ...option, label: t(option.label) }))}
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                helperText={t("settings.defaultVoltageHelper")}
              />
              <Input
                label={t("settings.electricityRate")}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.15"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                helperText={t("settings.electricityRateHelper")}
              />
            </div>
          </Card>

          {/* Support & legal */}
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4 flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-accent" />
              {t("settings.supportLegal")}
            </h3>
            <div className="flex flex-col divide-y divide-base-700">
              {SUPPORT_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 py-3 min-h-[48px] text-start hover:text-base-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-100">{t(link.label)}</p>
                    <p className="text-2xs text-base-400">{t(link.description)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-base-400 rtl:rotate-180 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={handleReset}>
              {t("common.reset")}
            </Button>
            <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>
              {saved ? t("common.saved") : t("settings.saveChanges")}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
