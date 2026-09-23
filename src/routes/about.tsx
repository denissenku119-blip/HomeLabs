import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/pages/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About HomeLab Architect" },
      {
        name: "description",
        content: "What HomeLab Architect does, how the planning works, and who it is for.",
      },
      { property: "og:title", content: "About HomeLab Architect" },
      {
        property: "og:description",
        content: "What HomeLab Architect does, how the planning works, and who it is for.",
      },
    ],
  }),
  component: AboutPage,
});
