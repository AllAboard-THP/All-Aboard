import { buildApp } from "./app.js";

const app = await buildApp();
const port = Number(process.env.PORT) || 4100;
const host = process.env.HOST ?? "0.0.0.0";

await app.listen({ port, host });
console.log(`agent listening on http://${host}:${port}`);
