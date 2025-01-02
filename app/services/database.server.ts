import { PrismaClient } from "@prisma/client";
import { getEnvironmentVariable } from "./environment.server";

getEnvironmentVariable("DATABASE_URL");

const database = new PrismaClient();

export { database };
