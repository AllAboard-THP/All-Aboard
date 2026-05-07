import { buildApp } from "./app.js";
const app = buildApp();
const port = Number(process.env.PORT) || 4000;
const host = process.env.HOST ?? "0.0.0.0";
await app.listen({ port, host });
console.log(`api listening on http://${host}:${port}`);
