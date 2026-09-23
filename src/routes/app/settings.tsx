import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/app/SettingsPage";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — HomeLab Architect" },
      { name: "description", content: "Language, currency and app preferences." },
      { property: "og:title", content: "Settings — HomeLab Architect" },
      { property: "og:description", content: "Language, currency and app preferences." },
    ],
  }),
  component: SettingsPage,
});
