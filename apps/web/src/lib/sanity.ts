import { createClient } from "@sanity/client";

export const projectId = "6qd28ej7";
export const dataset = "develop";
export const apiVersion = "2024-01-01";

// Sanity client for direct queries (used with React Query)
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  maxRetries: 0,
});
