import { index, prefix, route } from "@react-router/dev/routes";
import type { RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("login", "routes/login.tsx"),

  route("pictures/:pictureId", "routes/pictures.$id.ts"),

  ...prefix("manage", [
    index("routes/manage.home.tsx"),
    route("new", "routes/manage.new.tsx"),
  ]),
] satisfies RouteConfig;
