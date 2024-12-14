import { data, Form, useNavigation } from "react-router";
import { redirectAuthenticatedUser } from "~/services/session.server";
import { getEnvironmentVariable } from "~/services/environment.server";
import type { Route } from "./+types/login";

export function meta() {
  return [{ title: "Login" }];
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isAuthenticating = navigation.state === "submitting";

  return (
    <Form method="POST">
      <fieldset disabled={isAuthenticating}>
        <h1>Login</h1>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
        <button type="submit">
          {isAuthenticating ? "Logging in..." : "Login"}
        </button>
        {actionData?.feedback ? <b>{actionData?.feedback}</b> : null}
      </fieldset>
    </Form>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  await redirectAuthenticatedUser(request);

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const session = await redirectAuthenticatedUser(request);

  const formData = await request.formData();
  const password = formData.get("password");

  if (!password || typeof password !== "string") {
    throw data(
      { error: "Missing value for required field `password`" },
      { status: 400 },
    );
  }

  if (password != getEnvironmentVariable("ADMIN_PASSWORD")) {
    return data({ feedback: "Incorrect password" }, { status: 400 });
  }

  throw await session.authenticate({ redirectTo: "." });
}
