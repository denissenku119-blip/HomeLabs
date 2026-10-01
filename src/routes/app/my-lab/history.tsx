import { createFileRoute } from "@tanstack/react-router";
import { LabHistoryPage } from "@/pages/app/mylab/LabHistoryPage";

export const Route = createFileRoute("/app/my-lab/history")({
  head: () => ({
    meta: [
      { title: "Lab History — HomeLab Architect" },
      { name: "description", content: "See how your modeled homelab has evolved through applied changes." },
      { property: "og:title", content: "Lab History — HomeLab Architect" },
      { property: "og:description", content: "See how your modeled homelab has evolved through applied changes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LabHistoryPage,
});
