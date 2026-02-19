import { Elysia, t } from "elysia";
import { reportSubmissionSchema, type LocationValue } from "@ullatchi/types";
import { isWithinChennai } from "../lib/chennai-bounds";
import { getSanityClient } from "../lib/sanity";
import { generateSlug } from "../lib/utils";

export const reportRoutes = new Elysia({ prefix: "/api" }).post(
  "/report",
  async ({ body, set }) => {
    try {
      const result = reportSubmissionSchema.safeParse(body);
      if (!result.success) {
        set.status = 400;
        return { error: result.error.issues[0].message };
      }
      const { title, description } = result.data;
      const locationString = result.data.location?.trim() || "";
      const categoryId = result.data.category || null;
      const imageFile = body.image;

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
              set.status = 400;
              return { error: "Location must be within Chennai city limits" };
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

      set.status = 201;
      return { success: true, id: createdReport._id };
    } catch (error) {
      console.error("Error creating report:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create report";
      set.status = 500;
      return { error: errorMessage };
    }
  },
  {
    body: t.Object({
      title: t.String(),
      description: t.Optional(t.String()),
      location: t.Optional(t.String()),
      category: t.Optional(t.String()),
      image: t.Optional(t.File()),
    }),
  },
);
