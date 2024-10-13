import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./server/serve.ts"],
  format: "esm",
  outfile: "./build/serve.js",
  platform: "node",
});
