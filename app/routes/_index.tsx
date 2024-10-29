import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { database } from "~/database.server";

export default function Home() {
  const { randomPicture } = useLoaderData<typeof loader>();

  return (
    <>
      <img src={`/pictures/${randomPicture.id}`} />
    </>
  );
}

export async function loader() {
  const pictureCount = await database.picture.count();
  const randomIndex = Math.floor(Math.random() * pictureCount);
  const randomPicture = await database.picture.findFirst({
    skip: randomIndex,
  });

  if (!randomPicture) {
    throw new Error("No pictures!");
  }

  return json({ randomPicture });
}
