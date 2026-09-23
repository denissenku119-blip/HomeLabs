import { createFileRoute } from "@tanstack/react-router";
import { FeedbackPage } from "@/pages/FeedbackPage";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — HomeLab Architect" },
      {
        name: "description",
        content: "Report a bug, request a feature or send a suggestion for HomeLab Architect.",
      },
      { property: "og:title", content: "Feedback — HomeLab Architect" },
      {
        property: "og:description",
        content: "Report a bug, request a feature or send a suggestion for HomeLab Architect.",
      },
    ],
  }),
  component: FeedbackPage,
});
