import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { mapsRoutes } from "./routes/maps";
import { placesRoutes } from "./routes/places";
import { reportRoutes } from "./routes/report";
import { articleRoutes } from "./routes/article";

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : true;

const app = new Elysia()
  .use(cors({ origin: corsOrigins }))
  .get("/", () => ({ ok: true, message: "Ullatchi API is running" }))
  .use(mapsRoutes)
  .use(placesRoutes)
  .use(reportRoutes)
  .use(articleRoutes);

export default app;

if (process.env.VERCEL !== "1") {
  app.listen(3001);
  console.log(`API server running at http://localhost:${app.server?.port}`);
}
