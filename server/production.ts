import express from "express";
import compression from "compression";
import morgan from "morgan";

const BUILD_PATH = "../build/server/index.js";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();

app.use(compression());
app.use(morgan("tiny"));

app.disable("x-powered-by");

console.info("starting production server");

app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
);

app.use(express.static("build/client"));

app.use(await import(BUILD_PATH).then((mod) => mod.app));

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
