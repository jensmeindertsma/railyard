import { database } from "~/database.server";
import type { LoaderArguments } from "~/types/remix";

export async function loader({ params }: LoaderArguments) {
  const picture = params.picture;

  if (!picture || typeof picture !== "string") {
    throw new Error("Picture must be provided!");
  }

  // Find the image by its ID
  const image = await database.picture.findUnique({
    where: { id: picture },
    select: {
      id: true,
      filetype: true,
      bytes: true,
    },
  });

  if (!image) {
    throw new Response("Image not found", { status: 404 });
  }

  return new Response(image.bytes, {
    status: 200,
    headers: {
      "Content-Type": `image/${image.filetype}`,
      "Content-Disposition": `inline; filename="${image.id}.${image.filetype}"`,
    },
  });
}
