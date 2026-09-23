import { createFileRoute } from "@tanstack/react-router";
import { ProjectWorkspacePage } from "@/pages/app/ProjectWorkspacePage";

export const Route = createFileRoute("/app/project/$id/")({
  head: () => ({
    meta: [
      { title: "Project workspace — HomeLab Architect" },
      {
        name: "description",
        content: "Build your HomeLab: add hardware, connect it and watch cost and power update.",
      },
      { property: "og:title", content: "Project workspace — HomeLab Architect" },
      {
        property: "og:description",
        content: "Build your HomeLab: add hardware, connect it and watch cost and power update.",
      },
    ],
  }),
  component: ProjectWorkspacePage,
});
