import { createFileRoute } from "@tanstack/react-router";
import { LabHealthPage } from "@/pages/app/mylab/LabHealthPage";

export const Route = createFileRoute("/app/my-lab/health")({
  head: () => ({
    meta: [
      { title: "Lab Health — HomeLab Architect" },
      { name: "description", content: "An architectural health check of the homelab you actually run." },
      { property: "og:title", content: "Lab Health — HomeLab Architect" },
      { property: "og:description", content: "An architectural health check of the homelab you actually run." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LabHealthPage,
});
