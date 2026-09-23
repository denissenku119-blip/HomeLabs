import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/app/DashboardPage";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — HomeLab Architect" },
      {
        name: "description",
        content: "Your HomeLab overview: projects, totals and quick actions.",
      },
      { property: "og:title", content: "Dashboard — HomeLab Architect" },
      {
        property: "og:description",
        content: "Your HomeLab overview: projects, totals and quick actions.",
      },
    ],
  }),
  component: DashboardPage,
});
