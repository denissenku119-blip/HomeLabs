import { createFileRoute } from "@tanstack/react-router";
import { ProposalPage } from "@/pages/app/mylab/ProposalPage";

export const Route = createFileRoute("/app/my-lab/proposal")({
  head: () => ({
    meta: [
      { title: "Proposed Lab — HomeLab Architect" },
      { name: "description", content: "Compare your current lab with a proposed change before applying it." },
      { property: "og:title", content: "Proposed Lab — HomeLab Architect" },
      { property: "og:description", content: "Compare your current lab with a proposed change before applying it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProposalPage,
});
