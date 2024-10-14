import { database } from "~/database.server";
import type { LoaderArguments } from "~/types/remix";
import mime from "mime";

export async function loader({ params }: LoaderArguments) {
  const picture = params.picture;

  if (!picture || typeof picture !== "string") {
    throw new Error("Picture must be provided!");
  }

  // Find the image by its ID
  const image = await database.picture.findUnique({
    where: { id: Number() },
    select: {
      filename: true,
      bytes: true,
    },
  });

  if (!image) {
    throw new Response("Image not found", { status: 404 });
  }

  // Get the correct MIME type
  const mimeType = mime.getType(image.filename) || "application/octet-stream";

  return new Response(image.bytes, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${id}"`,
    },
  });
}
