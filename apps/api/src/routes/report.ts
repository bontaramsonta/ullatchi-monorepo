import { Hono } from "hono";
import { reportSubmissionSchema, type LocationValue } from "@ullatchi/types";
import { isWithinChennai } from "../lib/chennai-bounds";
import { getSanityClient } from "../lib/sanity";
import { generateSlug } from "../lib/utils";

export const reportRoutes = new Hono().basePath("/api");

reportRoutes.post("/report", async (c) => {
  try {
    const body = await c.req.parseBody();

    const formData = {
      title: body.title as string,
      description: body.description as string | undefined,
      location: body.location as string | undefined,
      category: body.category as string | undefined,
    };

    const result = reportSubmissionSchema.safeParse(formData);
    if (!result.success) {
      return c.json({ error: result.error.issues[0].message }, 400);
    }

    const { title, description } = result.data;
    const locationString = result.data.location?.trim() || "";
    const categoryId = result.data.category || null;
    const imageFile = body.image as File | undefined;

    let parsedLocation: LocationValue | null = null;
    if (locationString) {
      try {
        const locationData = JSON.parse(locationString) as LocationValue;
        if (
          locationData.name &&
          locationData.geopoint?.lat &&
          locationData.geopoint?.lng
        ) {
          const { lat, lng } = locationData.geopoint;
          if (!isWithinChennai(lat, lng)) {
            return c.json({ error: "Location must be within Chennai city limits" }, 400);
          }
          parsedLocation = locationData;
        }
      } catch {
        console.warn("Invalid location JSON received:", locationString);
      }
    }

    const client = getSanityClient();

    let imageAssetId: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const asset = await client.assets.upload("image", buffer, {
        filename: imageFile.name || "report-image",
      });
      imageAssetId = asset._id;
    }

    const slug = generateSlug(title);

    const reportData = {
      _type: "report" as const,
      title,
      slug: { _type: "slug" as const, current: slug },
      description: description || undefined,
      ...(parsedLocation && {
        location: {
          _type: "locationWithName" as const,
          name: parsedLocation.name,
          geopoint: {
            _type: "geopoint" as const,
            lat: parsedLocation.geopoint.lat,
            lng: parsedLocation.geopoint.lng,
          },
        },
      }),
      dateReported: new Date().toISOString(),
      status: "under-review" as const,
      ...(categoryId && {
        category: { _type: "reference" as const, _ref: categoryId },
      }),
      ...(imageAssetId && {
        image: {
          _type: "image" as const,
          asset: { _type: "reference" as const, _ref: imageAssetId },
          alt: title,
        },
      }),
    };

    const createdReport = await client.create(reportData);

    return c.json({ success: true, id: createdReport._id }, 201);
  } catch (error) {
    console.error("Error creating report:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create report";
    return c.json({ error: errorMessage }, 500);
  }
});
