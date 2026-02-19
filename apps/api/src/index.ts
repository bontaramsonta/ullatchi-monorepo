import { Elysia } from "elysia";
import { mapsRoutes } from "./routes/maps";
import { placesRoutes } from "./routes/places";
import { reportRoutes } from "./routes/report";
import { articleRoutes } from "./routes/article";

const app = new Elysia()
  .use(mapsRoutes)
  .use(placesRoutes)
  .use(reportRoutes)
  .use(articleRoutes)
  .listen(3001);

console.log(`API server running at http://localhost:${app.server?.port}`);
