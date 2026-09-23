import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/pages/legal/LegalPage";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — HomeLab Architect" },
      {
        name: "description",
        content:
          "Cost, power, storage and network figures in HomeLab Architect are estimates, not professional advice.",
      },
      { property: "og:title", content: "Disclaimer — HomeLab Architect" },
      {
        property: "og:description",
        content:
          "Cost, power, storage and network figures in HomeLab Architect are estimates, not professional advice.",
      },
    ],
  }),
  component: () => <LegalPage docId="disclaimer" />,
});
