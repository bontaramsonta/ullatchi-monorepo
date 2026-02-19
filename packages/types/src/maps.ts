import { z } from "zod";

export const staticMapQuerySchema = z.object({
  lat: z
    .string()
    .transform(Number)
    .pipe(z.number({ message: "Valid lat is required" })),
  lng: z
    .string()
    .transform(Number)
    .pipe(z.number({ message: "Valid lng is required" })),
  size: z
    .string()
    .regex(/^\d+x\d+$/, "Invalid size format. Use WxH (e.g., 400x200)")
    .optional()
    .default("400x200"),
  zoom: z
    .string()
    .optional()
    .default("15")
    .transform(Number)
    .pipe(z.number().int().min(1, "Zoom must be between 1 and 21").max(21, "Zoom must be between 1 and 21")),
});

export type StaticMapQuery = z.infer<typeof staticMapQuerySchema>;
