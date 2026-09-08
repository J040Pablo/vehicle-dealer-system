import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "@/shared/layouts/app-layout";
import { DashboardPage } from "@/modules/dashboard/pages/dashboard-page";
import { VehiclesPage } from "@/modules/vehicles/pages/vehicles-page";
import { DealersPage } from "@/modules/dealers/pages/dealers-page";
import { LoginPage } from "@/modules/auth/pages/login-page";
import { ProtectedRoute } from "@/shared/components/protected-route";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "veiculos", element: <VehiclesPage /> },
          { path: "concessionarias", element: <DealersPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
