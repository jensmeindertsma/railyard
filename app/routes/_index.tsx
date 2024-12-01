import {
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  UploadHandlerPart,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { database } from "~/database.server";
import { ActionArguments } from "~/types/remix";
import { getEnvironmentVariable } from "~/tools/environment.server";
import path from "node:path";
import fs, { constants } from "node:fs/promises";
import sharp from "sharp";
import { useEffect, useRef } from "react";

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
          <input type="file" id="picture" name="picture" accept="image/*" />

          <label htmlFor="date">
            Enter the date when the picture was taken
          </label>
          <input type="date" id="date" name="date" />

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

export async function action({ request }: ActionArguments) {
  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      handlePictureUpload,
      unstable_createMemoryUploadHandler(),
    ),
  );

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

async function handlePictureUpload({ name, data }: UploadHandlerPart) {
  if (name === "picture") {
    const id = crypto.randomUUID();

    console.log("new image, generated id: " + id);

    const picturesPath = getEnvironmentVariable("PICTURES_DIRECTORY");
    try {
      await fs.access(picturesPath, constants.F_OK);
    } catch {
      await fs.mkdir(picturesPath);
    }

    const chunks = [];
    for await (const chunk of data) {
      chunks.push(chunk);
    }
    const input = Buffer.concat(chunks);

    const startSize = input.length;

    const image = sharp(input);
    const metadata = await image.metadata();

    console.log(
      `Received image ${metadata.width}x${metadata.height} type = ${metadata.format} size = ${metadata.size} bytes`,
    );
    console.warn("TODOL handle EXIF data: " + metadata.exif?.length);

    console.log("compressing....");

    const output = await image
      .png({
        palette: true,
        compressionLevel: 9,
      })
      .toBuffer();

    const finalSize = output.length;
    console.log(
      `Converted image, start =  ${startSize} final = ${finalSize}, diff = ${startSize - finalSize} bytes = ${((finalSize - startSize) / startSize) * 100}`,
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
