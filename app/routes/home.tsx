import path from "node:path";
import fs, { constants } from "node:fs/promises";
import { redirect, Form, useLoaderData, useNavigation } from "react-router";
import sharp from "sharp";
import { useEffect, useRef } from "react";
import { parseFormData } from "@mjackson/form-data-parser";
import { getEnvironmentVariable } from "~/tools/environment.server";
import { database } from "~/database.server";
import type { FileUpload } from "@mjackson/form-data-parser";
import type { Route } from "./+types/home";

export default function Home() {
  const pictures = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const isUploading =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "create";

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isUploading) {
      formRef.current?.reset();
    }
  }, [isUploading]);

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
      <Form method="POST" encType="multipart/form-data" ref={formRef}>
        <fieldset disabled={isUploading}>
          <input type="hidden" name="intent" value="create" />

          <h2>Upload Train Picture</h2>

          <label htmlFor="picture">Choose picture to upload</label>
          <input type="file" id="picture" name="picture" accept="image/*" required />

          <label htmlFor="date">
            Enter the date when the picture was taken
          </label>
          <input type="date" id="date" name="date" required />

          <button type="submit">Upload New Train Picture</button>
          {isUploading ? <em>uploading........</em> : null}
        </fieldset>
      </Form>
    </>
  );
}

export async function loader() {
  return await database.picture.findMany();
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await parseFormData(request, handlePictureUpload);

  const pictureId = formData.get("picture");

  if (!pictureId || typeof pictureId !== "string") {
    return Response.json(
      { error: "Missing field `pictureId`" },
      { status: 400 },
    );
  }

  const date = formData.get("date");

  if (!date || typeof date !== "string") {
    return Response.json({ error: "Missing field `date`" }, { status: 400 });
  }

  console.log("date = ", date);

  await database.picture.create({
    data: {
      id: pictureId,
      date: new Date(date),
    },
  });

  return redirect("/");
}

async function handlePictureUpload(upload: FileUpload) {
  if (upload.fieldName === "picture" && upload.type.startsWith("image/")) {
    const id = crypto.randomUUID();

    const picturesPath = getEnvironmentVariable("PICTURES_DIRECTORY");
    try {
      await fs.access(picturesPath, constants.F_OK);
    } catch {
      await fs.mkdir(picturesPath);
    }

    console.log("Accepting new image upload");
    const input = await upload.bytes();
    console.log("Received new image");

    const initialSize = input.length;

    const image = sharp(input);
    const metadata = await image.metadata();

    const initialWidth = metadata.width;
    const initialHeight = metadata.height;
    const initialFormat = metadata.format;

    console.warn("TODO: handle EXIF data: " + metadata.exif?.length);

    const output = await image
      .png({
        palette: true,
        compressionLevel: 9,
      })
      .resize({
        width: 3840,
        height: 2160,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const finalSize = output.length;

    console.log("--- Processed image ---");
    console.log(`* initial dimensions = ${initialWidth}x${initialHeight}`);
    console.log("* initial format = " + initialFormat);
    console.log(`* initial size = ${formatBytes(initialSize)}`);
    console.log("* assigned id = " + id);
    console.log(`* final size = ${formatBytes(finalSize)}`);
    console.log(
      `* compression reduced size by ${-1 * Math.floor(((finalSize - initialSize) / initialSize) * 100)}%`,
    );

    try {
      await fs.writeFile(path.join(picturesPath, `${id}.png`), output);
    } catch (error) {
      console.error(`Failed to save file: ${error}`);
    }

    return id;
  }

  return undefined;
}

function formatBytes(length: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;

  while (length >= 1024 && index < units.length - 1) {
    length /= 1024;
    index++;
  }

  return `${length.toFixed(2)} ${units[index]}`;
}
