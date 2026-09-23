import { createFileRoute } from "@tanstack/react-router";
import { NewProjectPage } from "@/pages/app/NewProjectPage";

export const Route = createFileRoute("/app/new")({
  head: () => ({
    meta: [
      { title: "New project — HomeLab Architect" },
      {
        name: "description",
        content: "Start a new HomeLab plan: name it, set your goal, level and budget.",
      },
      { property: "og:title", content: "New project — HomeLab Architect" },
      {
        property: "og:description",
        content: "Start a new HomeLab plan: name it, set your goal, level and budget.",
      },
    ],
  }),
  component: NewProjectPage,
});
