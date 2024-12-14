import { database } from "~/services/database.server";
import type { Route } from "./+types/index";

export default function Home({ loaderData: pictures }: Route.ComponentProps) {
  return (
    <>
      <h1>Pictures</h1>
      {pictures.length == 0 ? (
        <p>No pictures!</p>
      ) : (
        <ul>
          {pictures.map((picture) => (
            <li key={picture.id}>
              <img src={`/pictures/${picture.id}`} style={{ width: "30%" }} />
              <p>Date taken: {picture.date.toDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export async function loader() {
  return await database.picture.findMany();
}
