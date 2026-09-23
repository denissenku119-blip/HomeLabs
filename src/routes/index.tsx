import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/pages/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HomeLab Architect — Design it before you buy it." },
      {
        name: "description",
        content:
          "Plan your home server setup: pick hardware, map the network, and see cost, power and storage before you spend a cent.",
      },
      { property: "og:title", content: "HomeLab Architect — Design it before you buy it." },
      {
        property: "og:description",
        content:
          "Plan your home server setup: pick hardware, map the network, and see cost, power and storage before you spend a cent.",
      },
    ],
  }),
  component: LandingPage,
});
