import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { staticMapQuerySchema } from "@ullatchi/types";
import { isWithinChennai } from "../lib/chennai-bounds";

export const mapsRoutes = new Hono().basePath("/api/maps");

mapsRoutes.get("/key", (c) => {
  const key = process.env.GOOGLE_MAPS_FRONTEND_KEY;
  if (!key) {
    return c.json({ error: "Maps API key not configured" }, 500);
  }

  c.header("Cache-Control", "private, max-age=3600");
  return c.json({ key });
});

mapsRoutes.get(
  "/static",
  zValidator("query", staticMapQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: result.error.issues[0].message }, 400);
    }
  }),
  async (c) => {
    const apiKey = process.env.GOOGLE_MAPS_FRONTEND_KEY;
    if (!apiKey) {
      return c.json({ error: "Maps API not configured" }, 500);
    }

    const { lat: latNum, lng: lngNum, size: sizeStr, zoom: zoomNum } = c.req.valid("query");

    if (!isWithinChennai(latNum, lngNum)) {
      return c.json({ error: "Location must be within Chennai city limits" }, 400);
    }

    try {
      const params = new URLSearchParams({
        center: `${latNum},${lngNum}`,
        zoom: zoomNum.toString(),
        size: sizeStr,
        markers: `color:red|${latNum},${lngNum}`,
        key: apiKey,
        scale: "2",
      });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Google Static Maps API responded with status ${response.status}`);
      }

      const imageBuffer = await response.arrayBuffer();

      return c.body(imageBuffer, 200, {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Content-Type": "image/png",
      });
    } catch (error) {
      console.error("Error fetching static map:", error);
      return c.json({ error: "Failed to fetch static map" }, 500);
    }
  }
);
