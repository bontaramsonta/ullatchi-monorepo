import { Hono } from "hono";
import { isWithinChennai, CHENNAI_CENTER } from "../lib/chennai-bounds";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleApiResponse = any;

export const placesRoutes = new Hono().basePath("/api/places");

placesRoutes.get("/autocomplete", async (c) => {
  const apiKey = process.env.GOOGLE_MAPS_FRONTEND_KEY;
  if (!apiKey) {
    return c.json({ error: "Maps API not configured" }, 500);
  }

  const input = c.req.query("input");
  const sessionToken = c.req.query("sessionToken");

  if (!input || input.trim().length < 2) {
    return c.json({ error: "Input query is required (min 2 characters)" }, 400);
  }

  try {
    const params = new URLSearchParams({
      input: input.trim(),
      key: apiKey,
      components: "country:in",
      locationbias: `circle:50000@${CHENNAI_CENTER.lat},${CHENNAI_CENTER.lng}`,
      language: "en",
    });

    if (sessionToken) {
      params.append("sessiontoken", sessionToken);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google API responded with status ${response.status}`);
    }

    const data: GoogleApiResponse = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.status, data.error_message);
      return c.json({ error: "Failed to fetch suggestions" }, 500);
    }

    const predictions = (data.predictions || []).map(
      (p: {
        place_id: string;
        description: string;
        structured_formatting?: {
          main_text?: string;
          secondary_text?: string;
        };
      }) => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting?.main_text || p.description,
        secondaryText: p.structured_formatting?.secondary_text || "",
      })
    );

    return c.json({ predictions });
  } catch (error) {
    console.error("Error fetching autocomplete:", error);
    return c.json({ error: "Failed to fetch suggestions" }, 500);
  }
});

placesRoutes.get("/details", async (c) => {
  const apiKey = process.env.GOOGLE_MAPS_FRONTEND_KEY;
  if (!apiKey) {
    return c.json({ error: "Maps API not configured" }, 500);
  }

  const placeId = c.req.query("placeId");
  const sessionToken = c.req.query("sessionToken");

  if (!placeId) {
    return c.json({ error: "placeId is required" }, 400);
  }

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      fields: "geometry,formatted_address,name",
      language: "en",
    });

    if (sessionToken) {
      params.append("sessiontoken", sessionToken);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google API responded with status ${response.status}`);
    }

    const data: GoogleApiResponse = await response.json();

    if (data.status !== "OK") {
      console.error("Google Place Details API error:", data.status, data.error_message);
      return c.json({ error: "Failed to fetch place details" }, 500);
    }

    const result = data.result;
    const lat = result.geometry?.location?.lat;
    const lng = result.geometry?.location?.lng;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return c.json({ error: "Could not get coordinates for this place" }, 400);
    }

    if (!isWithinChennai(lat, lng)) {
      return c.json({ error: "Location must be within Chennai city limits" }, 400);
    }

    return c.json({
      name: result.name || result.formatted_address,
      formattedAddress: result.formatted_address,
      lat,
      lng,
    });
  } catch (error) {
    console.error("Error fetching place details:", error);
    return c.json({ error: "Failed to fetch place details" }, 500);
  }
});

placesRoutes.get("/reverse-geocode", async (c) => {
  const apiKey = process.env.GOOGLE_MAPS_FRONTEND_KEY;
  if (!apiKey) {
    return c.json({ error: "Maps API not configured" }, 500);
  }

  const lat = c.req.query("lat");
  const lng = c.req.query("lng");

  const latNum = parseFloat(lat || "");
  const lngNum = parseFloat(lng || "");

  if (isNaN(latNum) || isNaN(lngNum)) {
    return c.json({ error: "Valid lat and lng are required" }, 400);
  }

  if (!isWithinChennai(latNum, lngNum)) {
    return c.json({ error: "Location must be within Chennai city limits" }, 400);
  }

  try {
    const params = new URLSearchParams({
      latlng: `${latNum},${lngNum}`,
      key: apiKey,
      language: "en",
      result_type: "street_address|route|neighborhood|sublocality|locality",
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google Geocoding API responded with status ${response.status}`);
    }

    const data: GoogleApiResponse = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Geocoding API error:", data.status, data.error_message);
      return c.json({ error: "Failed to reverse geocode" }, 500);
    }

    if (!data.results || data.results.length === 0) {
      return c.json({
        name: `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`,
        formattedAddress: null,
      });
    }

    const result = data.results[0];
    let name = result.formatted_address;
    const addressComponents = result.address_components || [];

    const priorities = [
      "neighborhood",
      "sublocality_level_1",
      "sublocality",
      "locality",
      "route",
    ];

    for (const priority of priorities) {
      const component = addressComponents.find(
        (comp: { types: string[]; long_name: string }) => comp.types.includes(priority)
      );
      if (component) {
        name = component.long_name;
        break;
      }
    }

    return c.json({ name, formattedAddress: result.formatted_address });
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return c.json({ error: "Failed to reverse geocode" }, 500);
  }
});
