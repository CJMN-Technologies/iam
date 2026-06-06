import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./pages/Login";
import { IAMPortal } from "./pages/IAMPortal";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/iam-portal",
    Component: IAMPortal,
  },
  {
    path: "*",
    Component: () => <Navigate to="/" replace />
  }
]);
