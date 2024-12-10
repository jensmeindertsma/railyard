import { redirect, Form, data, Link } from "react-router";
import { database } from "~/services/database.server";
import { getSession } from "~/services/session.server";
import type { Route } from "./+types/manage.home";

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <Link to="/manage/new">New</Link>
            </li>
          </ul>
          <Form method="POST">
            <input type="hidden" name="intent" value="quit" />

            <button type="submit">Quit</button>
          </Form>
        </nav>
      </header>
      <ul>
        {loaderData.pictures.map((picture) => (
          <li key={picture.id}>
            <img src={`/pictures/${picture.id}`} style={{ width: "30%" }} />
            <p>Date taken: {picture.date.toDateString()}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export async function loader({ request }: Route.ActionArgs) {
  const session = await getSession(request);

  if (!session.isAuthenticated) {
    throw redirect("/login");
  }

  return {
    pictures: await database.picture.findMany(),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request);

  if (!session.isAuthenticated) {
    throw redirect("/login");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (!intent || typeof intent !== "string") {
    throw data(
      { error: "Missing value for required field `intent`" },
      { status: 400 },
    );
  }

  switch (intent) {
    case "quit": {
      throw await session.destroy({ redirectTo: "." });
    }

    default: {
      throw data(
        { error: `Unknown value \`${intent}\` for field \`intent\`` },
        { status: 400 },
      );
    }
  }
}
