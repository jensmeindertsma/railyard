import {
  createCookie,
  createCookieSessionStorage,
  redirect,
} from "react-router";
import { getEnvironmentVariable } from "./environment.server";

const cookie = createCookie("railyard", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secrets: [getEnvironmentVariable("SESSION_SECRET")],
});

const sessionStorage = createCookieSessionStorage({ cookie });

export async function getSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  if (session.get("admin") == true) {
    return {
      isAuthenticated: true as const,
      async destroy({ redirectTo }: { redirectTo: string }) {
        return redirect(redirectTo, {
          headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
          },
        });
      },
    };
  } else {
    return {
      isAuthenticated: false as const,
      async authenticate({ redirectTo }: { redirectTo: string }) {
        session.set("admin", true);
        return redirect(redirectTo, {
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
        });
      },
    };
  }
}
