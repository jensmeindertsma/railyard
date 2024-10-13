import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { database } from "~/database.server";
import { ActionArguments } from "~/types/remix";

export default function Home() {
  const { pictures } = useLoaderData<typeof loader>();

  const uploadFormRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const isUploading =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "upload";

  useEffect(() => {
    if (!isUploading) {
      // Finished uploading, clear the form
      uploadFormRef.current?.reset();
    }
  }, [isUploading]);

  return (
    <main>
      <h1>Welcome to Railyard</h1>
      <h2>Pictures</h2>
      <ul>
        {pictures.map((picture) => (
          <li key={picture.id}>
            <h3>{picture.name}</h3>
            <p>
              {new Date(picture.date_taken)
                .toLocaleDateString("en-GB", {
                  day: "numeric",
                  weekday: "long",
                  month: "long",
                  year: "numeric",
                })
                .replace(",", "")}
            </p>
          </li>
        ))}
      </ul>

      <Form method="post" ref={uploadFormRef}>
        <input type="hidden" name="intent" value="upload" />

        <h2>New Picture</h2>

        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          style={{ display: "block" }}
        />

        <p>TODO: add image uploading here!!!</p>

        <button type="submit">Upload new picture</button>
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
