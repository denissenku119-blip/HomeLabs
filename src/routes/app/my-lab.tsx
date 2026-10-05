import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MyLabProGate } from "@/pages/app/mylab/MyLabProGate";

/** Every /app/my-lab/* page requires Pro; the gate renders the page via <Outlet /> for Pro users. */
export const Route = createFileRoute("/app/my-lab")({
  component: () => (
    <MyLabProGate>
      <Outlet />
    </MyLabProGate>
  ),
});
