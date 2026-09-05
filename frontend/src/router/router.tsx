import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/shared/layouts/app-layout";
import { DashboardPage } from "@/modules/dashboard/pages/dashboard-page";
import { VehiclesPage } from "@/modules/vehicles/pages/vehicles-page";
import { DealersPage } from "@/modules/dealers/pages/dealers-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "veiculos", element: <VehiclesPage /> },
      { path: "concessionarias", element: <DealersPage /> },
    ],
  },
]);
