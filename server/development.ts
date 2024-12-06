import express from "express";
import morgan from "morgan";

const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();

app.use(morgan("tiny"));

app.disable("x-powered-by");

console.info("starting development server");

const viteDevServer = await import("vite").then((vite) =>
  vite.createServer({
    server: { middlewareMode: true },
  }),
);

app.use(viteDevServer.middlewares);

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
  console.log(`listening on http://localhost:${PORT}`);
});
