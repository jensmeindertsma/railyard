import fs, { constants } from "node:fs/promises";
import path from "node:path";
import { data, Form, redirect, useNavigation } from "react-router";
import { useEffect, useRef } from "react";
import sharp from "sharp";
import { getSession } from "~/services/session.server";
import { database } from "~/services/database.server";
import { getEnvironmentVariable } from "~/services/environment.server";
import type { Route } from "./+types/manage.new";

export function meta() {
  return [{ title: "Login" }];
}

export default function New({ actionData }: Route.ComponentProps) {
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

  if (actionData?.stage === "details") {
    const {
      initialFormat,
      initialHeight,
      initialWidth,
      initialSize,
      finalSize,
    } = actionData.optimization;
    return (
      <>
        <img src={actionData.preview} width={300} />
        <ul>
          <li>Initial format = {initialFormat}</li>
          <li>Initial width = {initialWidth}</li>
          <li>Initial height = {initialHeight}</li>
          <li>Initial size = {formatBytes(initialSize)}</li>
          <li>Final size = {formatBytes(finalSize)}</li>
          <li>
            Optimization savings ={formatBytes(initialSize - finalSize)} =
            {-1 * Math.floor(((finalSize - initialSize) / initialSize) * 100)}%
          </li>
        </ul>
        <Form method="POST">
          <input type="hidden" name="intent" value="save" />
          <input type="hidden" name="id" value={actionData.imageId} />

          <label htmlFor="date">Date</label>
          <input type="date" id="date" name="date" required />

          <button type="submit">Save</button>
        </Form>
      </>
    );
  }

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
    throw data({ error: "Missing field `intent`" }, { status: 400 });
  }

  switch (intent) {
    case "upload": {
      const file = formData.get("picture");

      if (!(file instanceof File)) {
        throw data(
          { error: "Field `picture` must be of type `File`" },
          { status: 400 },
        );
      }

      // (1) Ensure picture directory exists
      const picturesPath = getEnvironmentVariable("PICTURES_DIRECTORY");
      try {
        await fs.access(picturesPath, constants.F_OK);
      } catch {
        await fs.mkdir(picturesPath);
      }
      // (1) ---

      // (2) Get image and optimise
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { image, metadata } = await optimiseImage(bytes);

      const initialSize = bytes.length;
      const initialWidth = metadata.width;
      const initialHeight = metadata.height;
      const initialFormat = metadata.format;
      const finalSize = image.length;

      const imageId = crypto.randomUUID();

      try {
        await fs.writeFile(path.join(picturesPath, `${imageId}.png`), image);
      } catch (error) {
        console.error(`Failed to save file: ${error}`);
      }

      const base64Iimage = image.toString("base64");
      const mimeType = "image/png";
      const dataUrl = `data:${mimeType};base64,${base64Iimage}`;

      return data({
        stage: "details" as const,
        preview: dataUrl,
        imageId,
        optimization: {
          initialSize,
          initialWidth,
          initialHeight,
          initialFormat,
          finalSize,
        },
      });
    }

    case "save": {
      const id = formData.get("id");

      if (!id || typeof id !== "string") {
        throw data({ error: "Missing field `id`" }, { status: 400 });
      }

      const date = formData.get("date");

      if (!date || typeof date !== "string") {
        throw data({ error: "Missing field `date`" }, { status: 400 });
      }

      await database.picture.create({
        data: {
          id,
          date: new Date(date),
        },
      });

      throw redirect("/manage");
    }

    default: {
      throw data({ error: "Unknown form intent" }, { status: 400 });
    }
  }
}

async function optimiseImage(input: Uint8Array) {
  const image = sharp(input);

  return {
    metadata: await image.metadata(),
    image: await image
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
      .toBuffer(),
  };
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
