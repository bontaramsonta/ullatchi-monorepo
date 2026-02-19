import { z } from "zod";

export const predictionSchema = z.object({
  placeId: z.string(),
  description: z.string(),
  mainText: z.string(),
  secondaryText: z.string(),
});

export const autocompleteResponseSchema = z.object({
  predictions: z.array(predictionSchema),
});

export const placeDetailsResponseSchema = z.object({
  name: z.string(),
  formattedAddress: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const reverseGeocodeResponseSchema = z.object({
  name: z.string(),
  formattedAddress: z.string().nullable(),
});

export type Prediction = z.infer<typeof predictionSchema>;
export type AutocompleteResponse = z.infer<typeof autocompleteResponseSchema>;
export type PlaceDetailsResponse = z.infer<typeof placeDetailsResponseSchema>;
export type ReverseGeocodeResponse = z.infer<typeof reverseGeocodeResponseSchema>;
