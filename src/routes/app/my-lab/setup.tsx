import { createFileRoute } from "@tanstack/react-router";
import { MyLabSetupPage } from "@/pages/app/mylab/MyLabSetupPage";

export const Route = createFileRoute("/app/my-lab/setup")({
  head: () => ({
    meta: [
      { title: "Set up My Lab — HomeLab Architect" },
      { name: "description", content: "Add the hardware you own, configure it and connect it in a few quick steps." },
      { property: "og:title", content: "Set up My Lab — HomeLab Architect" },
      { property: "og:description", content: "Add the hardware you own, configure it and connect it in a few quick steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyLabSetupPage,
});
