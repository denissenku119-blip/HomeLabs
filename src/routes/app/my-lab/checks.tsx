import { createFileRoute } from "@tanstack/react-router";
import { WhatToCheckPage } from "@/pages/app/mylab/WhatToCheckPage";

export const Route = createFileRoute("/app/my-lab/checks")({
  head: () => ({
    meta: [
      { title: "What to Check — HomeLab Architect" },
      { name: "description", content: "Things worth investigating in the homelab you actually run." },
      { property: "og:title", content: "What to Check — HomeLab Architect" },
      { property: "og:description", content: "Things worth investigating in the homelab you actually run." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhatToCheckPage,
});
