import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./sass/styles.scss";
import Root from "./Root";
import { I18nProvider } from "i18n/context";

const rootElement = document.getElementById("app");

if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

const router = createBrowserRouter([{ path: "*", Component: Root }]);

root.render(
  <I18nProvider>
    <RouterProvider router={router} />
  </I18nProvider>,
);
