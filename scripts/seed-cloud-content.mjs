import { readFile } from "node:fs/promises";
import { put } from "@vercel/blob";

if (process.argv[2]) process.loadEnvFile(process.argv[2]);
if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) throw new Error("Connect the intended private Blob store first.");
const seed = JSON.parse(await readFile(new URL("../config/content-seed.json", import.meta.url), "utf8"));
if (Object.keys(seed.draft).length || Object.keys(seed.draftCollections).length || seed.history.length) throw new Error("Release seed must contain published content only.");
try {
  await put("cms/content.json", JSON.stringify(seed), { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: false });
  console.log(`Initialized durable content at published revision ${seed.revision}.`);
} catch (error) {
  if (error instanceof Error && /already exists/i.test(error.message)) console.log("Durable content already exists; left unchanged.");
  else throw error;
}
