import express from "express";
import morgan from "morgan";

const PORT = Number.parseInt(process.env.PORT || "3000");

console.info("(RAILYARD) Starting development server ...");

const app = express();

app.use(morgan("tiny"));

app.disable("x-powered-by");

console.info("(RAILYARD) Loading Vite ...");

const viteDevServer = await import("vite").then((vite) =>
  vite.createServer({
    server: { middlewareMode: true },
  }),
);

app.use(viteDevServer.middlewares);

console.info("(RAILYARD) Setting up application request handler ...");

app.use(async (request, response, next) => {
  try {
    const source = await viteDevServer.ssrLoadModule("./server/app.ts");
    return await source.app(request, response, next);
  } catch (error) {
    if (typeof error === "object" && error instanceof Error) {
      viteDevServer.ssrFixStacktrace(error);
    }
    next(error);
  }
});

app.listen(PORT, () => {
  console.info(`(RAILYARD) Listening on http://localhost:${PORT}`);
});
