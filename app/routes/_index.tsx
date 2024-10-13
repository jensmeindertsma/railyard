import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { database } from "~/database.server";
import { ActionArguments } from "~/types/remix";

export default function Home() {
  const { pictures } = useLoaderData<typeof loader>();

  return (
    <main>
      <h1>Welcome to Railyard</h1>
      <h2>Pictures</h2>
      <ul>
        {pictures.map((picture) => (
          <li key={picture.id}>
            <h3>{picture.name}</h3>
            <p>{picture.date_taken}</p>
          </li>
        ))}
      </ul>
      <Form method="post">
        <h2>New Picture</h2>

        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          style={{ display: "block" }}
        />

        <button type="submit">Save new picture</button>
      </Form>
    </main>
  );
}

export async function loader() {
  const pictures = await database.picture.findMany({
    select: { id: true, name: true, date_taken: true },
  });

  return json({ pictures });
}

export async function action({ request }: ActionArguments) {
  const formData = await request.formData();
  const fields = Object.fromEntries(formData);

  await database.picture.create({
    data: {
      data: Buffer.from("hello world"),
      name: fields.name as string,
      date_taken: new Date(),
    },
  });

  return redirect("/");
}
