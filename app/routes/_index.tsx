import { redirect, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { database } from "~/database.server";
import { ActionArguments } from "~/types/remix";
import { getEnvironmentVariable } from "~/tools/environment.server";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";

export default function Home() {
  const pictures = useLoaderData<typeof loader>();

  return (
    <>
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
      <Form method="POST" encType="multipart/form-data">
        <h2>Upload Train Picture</h2>

        <label htmlFor="picture">Choose picture to upload</label>
        <input type="file" id="picture" name="picture" accept="image/*" />

        <label htmlFor="date">
          Enter the date and time when the picture was taken
        </label>
        <input type="datetime-local" id="date" name="date" />

        <button type="submit">Upload New Train Picture</button>
      </Form>
    </>
  );
}

export async function loader() {
  return await database.picture.findMany();
}

export async function action({ request }: ActionArguments) {
  const formData = await unstable_parseMultipartFormData(
    request,
    async ({ name, data }) => {
      if (name === "picture") {
        const id = crypto.randomUUID();

        console.log("new image, generated id: " + id);

        try {
          await fs.mkdir(getEnvironmentVariable("PICTURES_DIRECTORY"));
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          console.info("directories are ready");
        }

        const chunks = [];

        for await (const chunk of data) {
          chunks.push(chunk);
        }

        // Combine all chunks into a single Buffer
        const input = Buffer.concat(chunks);

        console.log("finished decoding");

        const output = sharp(input);
        const metadata = await output.metadata();

        console.log(
          `Received image ${metadata.width}x${metadata.height} type = ${metadata.format} size = ${metadata.size} bytes`,
        );
        console.warn("TODOL handle EXIF data: " + metadata.exif);

        console.log("compressing....");

        await output
          .png({
            palette: true,
            compressionLevel: 9,
          })
          .toFile(
            path.join(
              getEnvironmentVariable("PICTURES_DIRECTORY"),
              `${id}.png`,
            ),
          );

        return id;
      }

      return null;
    },
  );

  const pictureId = formData.get("picture") as string;
  const date = new Date(formData.get("date") as string);

  await database.picture.create({
    data: {
      id: pictureId,
      date,
    },
  });

  return redirect("/");
}

async function getFileSize(path: string) {
  const BYTES_PER_MB = 1024 ** 2;
  const fileStats = await fs.stat(path);
  const fileSizeInMb = fileStats.size / BYTES_PER_MB;
  return fileSizeInMb;
}
