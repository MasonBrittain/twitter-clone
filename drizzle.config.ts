import type { Config } from "drizzle-kit";
import { run } from "node:test";

export default {
  schema: "./src/app/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql"
} satisfies Config;
