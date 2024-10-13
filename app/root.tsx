import "./root.css";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import { type ReactNode } from "react";
import {
  type MetaArguments,
  type LinksResult,
  type MetaResult,
} from "~/types/remix";

export function meta({ error }: MetaArguments): MetaResult {
  return [{ title: error ? "Error!" : "Trains!" }];
}

export function links(): LinksResult {
  return [
    {
      rel: "icon",
      href: "/favicon.png",
      type: "image/png",
    },
  ];
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  }

  return (
    <>
      <h1>Error!</h1>
      <p>{error instanceof Error ? error.message : "Unknown error"}</p>
    </>
  );
}
