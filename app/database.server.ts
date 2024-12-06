import { PrismaClient } from "@prisma/client";
import { getEnvironmentVariable } from "./tools/environment.server";

getEnvironmentVariable("DATABASE_URL");

const database = new PrismaClient();

export { database };
