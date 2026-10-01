import { createFileRoute } from "@tanstack/react-router";
import { PlanChangePage } from "@/pages/app/mylab/PlanChangePage";

export const Route = createFileRoute("/app/my-lab/plan")({
  head: () => ({
    meta: [
      { title: "Plan a change — HomeLab Architect" },
      { name: "description", content: "Safely model a change to your real homelab before making it." },
      { property: "og:title", content: "Plan a change — HomeLab Architect" },
      { property: "og:description", content: "Safely model a change to your real homelab before making it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanChangePage,
});
