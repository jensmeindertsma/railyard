import { LoaderArguments } from "~/types/remix";
import path from "node:path";
import fs from "node:fs/promises";
import { getEnvironmentVariable } from "~/tools/environment.server";

export async function loader({ params }: LoaderArguments) {
  if (!params.id) {
    throw new Error("Missing required ID");
  }

  const filePath = path.join(
    getEnvironmentVariable("PICTURES_DIRECTORY"),
    `${params.id}.png`,
  );

  try {
    const file = await fs.readFile(filePath);

    return new Response(file, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="${params.id}.png"`,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ENOENT")) {
        throw new Response("Image not found", { status: 404 });
      }
      console.error("Error loading image:", error);
      throw new Response("Internal Server Error", { status: 500 });
    }
  }
}
