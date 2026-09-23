import { createFileRoute } from "@tanstack/react-router";
import { ReportPage } from "@/pages/app/ReportPage";

export const Route = createFileRoute("/app/project/$id/report")({
  head: () => ({
    meta: [
      { title: "Project report — HomeLab Architect" },
      {
        name: "description",
        content: "A printable summary of your HomeLab plan: hardware, cost, power and storage.",
      },
      { property: "og:title", content: "Project report — HomeLab Architect" },
      {
        property: "og:description",
        content: "A printable summary of your HomeLab plan: hardware, cost, power and storage.",
      },
    ],
  }),
  component: ReportPage,
});
