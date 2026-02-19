import { createClient } from "@sanity/client";

const projectId = "6qd28ej7";
const dataset = "develop";
const apiVersion = "2024-01-01";

export function getSanityClient() {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error("SANITY_API_TOKEN environment variable is not set");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });
}
