import { Elysia, t } from "elysia";
import { staticMapQuerySchema } from "@ullatchi/types";
import { isWithinChennai } from "../lib/chennai-bounds";

export const mapsRoutes = new Elysia({ prefix: "/api/maps" })
  .get("/key", ({ set }) => {
    const key = process.env.GOOGLE_MAPS_FRONTEND_KEY;
    if (!key) {
      set.status = 500;
      return { error: "Maps API key not configured" };
    }

    set.headers["Cache-Control"] = "private, max-age=3600";
    return { key };
  })
  .get(
    "/static",
    async ({ query, set }) => {
      const apiKey = process.env.GOOGLE_MAPS_FRONTEND_KEY;
      if (!apiKey) {
        set.status = 500;
        return { error: "Maps API not configured" };
      }

      const parsed = staticMapQuerySchema.safeParse(query);
      if (!parsed.success) {
        set.status = 400;
        return { error: parsed.error.issues[0].message };
      }
      const { lat: latNum, lng: lngNum, size: sizeStr, zoom: zoomNum } = parsed.data;

      if (!isWithinChennai(latNum, lngNum)) {
        set.status = 400;
        return { error: "Location must be within Chennai city limits" };
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
          `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`Google Static Maps API responded with status ${response.status}`);
        }

        const imageBuffer = await response.arrayBuffer();

        set.headers["Cache-Control"] = "public, max-age=86400, s-maxage=86400";
        set.headers["Content-Type"] = "image/png";

        return new Response(imageBuffer, {
          headers: {
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
            "Content-Type": "image/png",
          },
        });
      } catch (error) {
        console.error("Error fetching static map:", error);
        set.status = 500;
        return { error: "Failed to fetch static map" };
      }
    },
    {
      query: t.Object({
        lat: t.String(),
        lng: t.String(),
        zoom: t.Optional(t.String()),
        size: t.Optional(t.String()),
      }),
    },
  );
