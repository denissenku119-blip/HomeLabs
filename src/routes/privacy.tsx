import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/pages/legal/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — HomeLab Architect" },
      {
        name: "description",
        content:
          "How HomeLab Architect handles your data: projects stay on your device and nothing is collected.",
      },
      { property: "og:title", content: "Privacy Policy — HomeLab Architect" },
      {
        property: "og:description",
        content:
          "How HomeLab Architect handles your data: projects stay on your device and nothing is collected.",
      },
    ],
  }),
  component: () => <LegalPage docId="privacy" />,
});
