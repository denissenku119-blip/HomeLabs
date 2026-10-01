import { createFileRoute } from "@tanstack/react-router";
import { MyLabPage } from "@/pages/app/mylab/MyLabPage";

export const Route = createFileRoute("/app/my-lab/")({
  head: () => ({
    meta: [
      { title: "My Lab — HomeLab Architect" },
      { name: "description", content: "Manage the homelab you actually own and run." },
      { property: "og:title", content: "My Lab — HomeLab Architect" },
      { property: "og:description", content: "Manage the homelab you actually own and run." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyLabPage,
});
