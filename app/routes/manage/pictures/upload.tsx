import fs, { constants } from "node:fs/promises";
import path from "node:path";
import { data, Form, redirect, useNavigation } from "react-router";
import sharp from "sharp";
import { enforceAuthentication } from "~/services/session.server";
import { database } from "~/services/database.server";
import { getEnvironmentVariable } from "~/services/environment.server";
import type { Route } from "../+types/upload";

export function meta() {
  return [{ title: "Upload" }];
}

export default function Upload({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isUploading = navigation.state === "submitting";

  return (
    <Form method="POST" encType="multipart/form-data">
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

        <button type="submit">{isUploading ? "Uploading..." : "Upload"}</button>
      </fieldset>
    </Form>
  );
}

export async function loader({ request }: Route.ActionArgs) {
  await enforceAuthentication(request);

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await enforceAuthentication(request);

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
