import path from "node:path";
import fs from "node:fs/promises";
import { getEnvironmentVariable } from "~/services/environment.server";
import type { Route } from "./+types/files.$id";

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.pictureId) {
    throw new Error("Missing required ID");
  }

  const filePath = path.join(
    getEnvironmentVariable("PICTURES_DIRECTORY"),
    `${params.pictureId}.png`,
  );

  try {
    const file = await fs.readFile(filePath);

    return new Response(file, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="${params.pictureId}.png"`,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ENOENT")) {
        throw Response.json({ error: "image not found" }, { status: 404 });
      }
      console.error("Error loading image:", error);
      throw Response.json({ error: "internal Server Error" }, { status: 500 });
    }
  }
}
