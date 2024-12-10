import fs, { constants } from "node:fs/promises";
import path from "node:path";
import { data, Form, redirect, useNavigation } from "react-router";
import { useEffect, useRef } from "react";
import sharp from "sharp";
import { getSession } from "~/services/session.server";
import { database } from "~/services/database.server";
import { getEnvironmentVariable } from "~/services/environment.server";
import type { FileUpload } from "@mjackson/form-data-parser";
import type { Route } from "./+types/manage.new";

export function meta() {
  return [{ title: "Login" }];
}

export default function New() {
  const navigation = useNavigation();
  const isUploading =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "upload";

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isUploading) {
      formRef.current?.reset();
    }
  }, [isUploading]);

  return (
    <Form method="POST" encType="multipart/form-data" ref={formRef}>
      <input type="hidden" name="intent" value="upload" />
      <fieldset disabled={isUploading}>
        <h2>Upload Train Picture</h2>

        <label htmlFor="picture">Choose picture to upload</label>
        <input
          type="file"
          id="picture"
          name="picture"
          accept="image/*"
          required
        />

        <label htmlFor="date">Enter the date when the picture was taken</label>
        <input type="date" id="date" name="date" required />

        <button type="submit">Upload New Train Picture</button>
        {isUploading ? <em>uploading........</em> : null}
      </fieldset>
    </Form>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request);

  if (!session.isAuthenticated) {
    throw redirect("/login");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (!intent || typeof intent !== "string") {
    return data({ error: "Missing field `intent`" }, { status: 400 });
  }

  switch (intent) {
    case "upload": {
      const pictureId = formData.get("picture");

      if (!pictureId || typeof pictureId !== "string") {
        return data({ error: "Missing field `pictureId`" }, { status: 400 });
      }

      const date = formData.get("date");

      if (!date || typeof date !== "string") {
        return data({ error: "Missing field `date`" }, { status: 400 });
      }

      await database.picture.create({
        data: {
          id: pictureId,
          date: new Date(date),
        },
      });

      throw redirect("/manage");
    }

    default: {
      return data({ error: "Unknown form intent" }, { status: 400 });
    }
  }
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

    const input = await upload.bytes();

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
