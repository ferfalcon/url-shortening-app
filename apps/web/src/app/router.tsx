import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/app-shell";
import { HomeRoute } from "../routes/home-route";
import { LoginRoute } from "../routes/login-route";
import { SignUpRoute } from "../routes/signup-route";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomeRoute />
      },
      {
        path: "login",
        element: <LoginRoute />
      },
      {
        path: "signup",
        element: <SignUpRoute />
      }
    ]
  }
]);
