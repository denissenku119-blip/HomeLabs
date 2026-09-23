import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/pages/legal/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — HomeLab Architect" },
      {
        name: "description",
        content: "The terms that apply when you use the HomeLab Architect planning app.",
      },
      { property: "og:title", content: "Terms of Use — HomeLab Architect" },
      {
        property: "og:description",
        content: "The terms that apply when you use the HomeLab Architect planning app.",
      },
    ],
  }),
  component: () => <LegalPage docId="terms" />,
});
