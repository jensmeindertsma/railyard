import {
  json,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { database } from "~/database.server";
import { ActionArguments } from "~/types/remix";
import mime from "mime";

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
            <h3>{picture.train.id}</h3>
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

      <Form method="post" ref={uploadFormRef} encType="multipart/form-data">
        <input type="hidden" name="intent" value="upload" />

        <h2>New Picture</h2>

        <label htmlFor="number">Train Identification Number</label>
        <input id="number" name="number" type="text" required />

        <label htmlFor="date">Select Date Taken</label>
        <input type="date" id="date" name="date" required />

        <label htmlFor="picture">Picture</label>
        <input
          id="picture"
          name="picture"
          type="file"
          accept="image/png, image/jpeg"
          required
        />

        <button type="submit">Upload new picture</button>
      </Form>
    </main>
  );
}

export async function loader() {
  const pictures = await database.picture.findMany({
    select: {
      id: true,
      date_taken: true,
      train: true,
      service: true,
      station: true,
    },
  });

  return json({ pictures });
}

export async function action({ request }: ActionArguments) {
  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_createMemoryUploadHandler({ maxPartSize: 300000000000 }),
  );

  const number = formData.get("number");
  const picture = formData.get("picture");
  const rawDate = formData.get("date");

  if (!number || typeof number !== "string") {
    throw new Error("Number is required!");
  }

  if (!picture || typeof picture === "string") {
    throw new Error("Picture is required!");
  }

  if (!rawDate || typeof rawDate !== "string") {
    throw new Error("Date is required!");
  }

  const mimeType = mime.getType(picture.name) || "unknown";
  if (!["image/jpeg", "image/png"].includes(mimeType)) {
    throw new Error("Unsupported file type. Only JPEG & PNG is supported");
  }

  const bytes = Buffer.from(await picture.arrayBuffer());

  await database.picture.create({
    data: {
      bytes,
      filename: picture.name,
      date_taken: new Date(rawDate),
      train: {
        connectOrCreate: {
          where: {
            id: number,
          },
          create: {
            id: number,
            series: {
              connectOrCreate: {
                where: {
                  name: "Vectron",
                },
                create: {
                  name: "Vectron",
                },
              },
            },
          },
        },
      },
      service: {
        connectOrCreate: {
          where: {
            id: "IC149",
          },
          create: {
            id: "IC149",
            origin: {
              connectOrCreate: {
                where: {
                  name: "Amsterdam",
                },
                create: {
                  name: "Amsterdam",
                  country: "Netherlands",
                },
              },
            },
            destination: {
              connectOrCreate: {
                where: {
                  name: "Berlin",
                },
                create: {
                  name: "Berlin",
                  country: "Germany",
                },
              },
            },
          },
        },
      },
      station: {
        connectOrCreate: {
          where: {
            name: "Utrecht",
          },
          create: {
            name: "Utrecht",
            country: "Netherlands",
          },
        },
      },
    },
  });

  return redirect("/");
}
