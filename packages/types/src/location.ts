import { z } from "zod";

export const geopointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const locationValueSchema = z.object({
  name: z.string(),
  geopoint: geopointSchema,
});

export type Geopoint = z.infer<typeof geopointSchema>;
export type LocationValue = z.infer<typeof locationValueSchema>;
