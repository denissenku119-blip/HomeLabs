import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "@/pages/app/ProjectsPage";

export const Route = createFileRoute("/app/projects")({
  head: () => ({
    meta: [
      { title: "My projects — HomeLab Architect" },
      { name: "description", content: "All your saved HomeLab plans in one place." },
      { property: "og:title", content: "My projects — HomeLab Architect" },
      { property: "og:description", content: "All your saved HomeLab plans in one place." },
    ],
  }),
  component: ProjectsPage,
});
