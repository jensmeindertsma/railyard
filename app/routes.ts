import { index, route } from "@react-router/dev/routes";
import type { RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),

  route("login", "routes/login.tsx"),

  route("files/:pictureId", "routes/files.$id.ts"),

  route("manage", "routes/manage/layout.tsx", [
    index("routes/manage/index.tsx"),
    route("files", "routes/manage/files.tsx"),
    route("upload", "routes/manage/upload.tsx"),
  ]),
] satisfies RouteConfig;
