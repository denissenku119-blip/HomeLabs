import { createFileRoute } from "@tanstack/react-router";
import { ReportPage } from "@/pages/app/ReportPage";

export const Route = createFileRoute("/app/my-lab/report")({
  head: () => ({
    meta: [
      { title: "My Lab Report — HomeLab Architect" },
      { name: "description", content: "A detailed report of the homelab you actually own, based on your modeled configuration." },
      { property: "og:title", content: "My Lab Report — HomeLab Architect" },
      { property: "og:description", content: "A detailed report of the homelab you actually own, based on your modeled configuration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyLabReportRoute,
});

function MyLabReportRoute() {
  return <ReportPage myLab />;
}
