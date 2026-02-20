import { Hono } from "hono";
import { cors } from "hono/cors";
import { mapsRoutes } from "./routes/maps";
import { placesRoutes } from "./routes/places";
import { reportRoutes } from "./routes/report";
import { articleRoutes } from "./routes/article";

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o: string) => o.trim())
  : ["*"];

const app = new Hono();

app.use("*", cors({ origin: corsOrigins }));
app.get("/", (c) => c.json({ ok: true, message: "Ullatchi API is running" }));
app.route("/", mapsRoutes);
app.route("/", placesRoutes);
app.route("/", reportRoutes);
app.route("/", articleRoutes);

export default app;
