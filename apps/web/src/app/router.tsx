import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/app-shell";
import { HomeRoute } from "../routes/home-route";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomeRoute />
      }
    ]
  }
]);
