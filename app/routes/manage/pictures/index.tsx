import { database } from "~/services/database.server";
import { enforceAuthentication } from "~/services/session.server";
import type { Route } from "../+types/index";

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h1>Pictures</h1>
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
  await enforceAuthentication(request);

  return {
    pictures: await database.picture.findMany(),
  };
}
