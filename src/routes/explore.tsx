import { createFileRoute } from "@tanstack/react-router";
import { ExplorePage } from "@/pages/ExplorePage";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore HomeLab blueprints — HomeLab Architect" },
      {
        name: "description",
        content: "Browse example home server blueprints and starting points for your own lab.",
      },
      { property: "og:title", content: "Explore HomeLab blueprints" },
      {
        property: "og:description",
        content: "Browse example home server blueprints and starting points for your own lab.",
      },
    ],
  }),
  component: ExplorePage,
});
