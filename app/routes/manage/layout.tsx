import { Form, Link, Outlet } from "react-router";
import { enforceAuthentication } from "~/services/session.server";
import type { Route } from "./+types/layout";

export default function Manage() {
  return (
    <>
      <header>
        <b>Railyard - Manage</b>
        <nav>
          <ul>
            <li>
              <Link to="/manage">Pictures</Link>
            </li>
            <li>
              <Link to="/manage/files">Files</Link>
            </li>
            <li>
              <Link to="/manage/new">Upload</Link>
            </li>
          </ul>
        </nav>
        <Form method="POST">
          <button type="submit">Quit</button>
        </Form>
      </header>

      <Outlet />
    </>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await enforceAuthentication(request);

  return session.destroy({ redirectTo: "/" });
}
