import { createRequestHandler } from "@remix-run/express";
import { type ServerBuild } from "@remix-run/node";
import compression from "compression";
import express from "express";
import morgan from "morgan";

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () =>
        viteDevServer.ssrLoadModule(
          "virtual:remix/server-build",
        ) as Promise<ServerBuild>
    : // @ts-ignore the types here are correct but the typechecker
      // fails when build files are present because they are plain JS
      // and the inferred type is incorrect.
      ((await import(
        // @ts-ignore this file may not exist at the time of typechecking
        "../build/server/index.js"
      )) as () => Promise<ServerBuild>),
});

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
}

app.use(express.static("build/client"));

app.use(morgan("tiny"));

app.all("*", remixHandler);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`),
);
