import { createFileRoute } from "@tanstack/react-router";
import { MyLabTopologyPage } from "@/pages/app/mylab/MyLabTopologyPage";

export const Route = createFileRoute("/app/my-lab/topology")({
  head: () => ({
    meta: [
      { title: "My Lab topology — HomeLab Architect" },
      { name: "description", content: "View and rearrange the topology of the homelab you actually run." },
      { property: "og:title", content: "My Lab topology — HomeLab Architect" },
      { property: "og:description", content: "View and rearrange the topology of the homelab you actually run." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyLabTopologyPage,
});
