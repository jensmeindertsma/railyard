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

export async function enforceAuthentication(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  if (session.get("admin") !== true) {
    throw redirect("/login");
  }

  return {
    async destroy({ redirectTo }: { redirectTo: string }): Promise<Response> {
      return redirect(redirectTo, {
        headers: {
          "Set-Cookie": await sessionStorage.destroySession(session),
        },
      });
    },
  };
}

export async function redirectUser(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  if (session.get("admin") === true) {
    throw redirect("/manage");
  }

  return {
    async authenticate({
      redirectTo,
    }: {
      redirectTo: string;
    }): Promise<Response> {
      session.set("admin", true);
      return redirect(redirectTo, {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      });
    },
  };
}
