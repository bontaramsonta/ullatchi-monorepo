import { Elysia, t } from "elysia";
import { isWithinChennai, CHENNAI_CENTER } from "../lib/chennai-bounds";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleApiResponse = any;

export const placesRoutes = new Elysia({ prefix: "/api/places" })
  .get(
    "/autocomplete",
    async ({ query, set }) => {
      const apiKey = process.env.GOOGLE_MAPS_FRONTEND_KEY;
      if (!apiKey) {
        set.status = 500;
        return { error: "Maps API not configured" };
      }

      if (!query.input || query.input.trim().length < 2) {
        set.status = 400;
        return { error: "Input query is required (min 2 characters)" };
      }

      try {
        const params = new URLSearchParams({
          input: query.input.trim(),
          key: apiKey,
          components: "country:in",
          locationbias: `circle:50000@${CHENNAI_CENTER.lat},${CHENNAI_CENTER.lng}`,
          language: "en",
        });

        if (query.sessionToken) {
          params.append("sessiontoken", query.sessionToken);
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`Google API responded with status ${response.status}`);
        }

        const data: GoogleApiResponse = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          console.error("Google Places API error:", data.status, data.error_message);
          set.status = 500;
          return { error: "Failed to fetch suggestions" };
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
          }),
        );

        return { predictions };
      } catch (error) {
        console.error("Error fetching autocomplete:", error);
        set.status = 500;
        return { error: "Failed to fetch suggestions" };
      }
    },
    {
      query: t.Object({
        input: t.String(),
        sessionToken: t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/details",
    async ({ query, set }) => {
      const apiKey = process.env.GOOGLE_MAPS_FRONTEND_KEY;
      if (!apiKey) {
        set.status = 500;
        return { error: "Maps API not configured" };
      }

      if (!query.placeId) {
        set.status = 400;
        return { error: "placeId is required" };
      }

      try {
        const params = new URLSearchParams({
          place_id: query.placeId,
          key: apiKey,
          fields: "geometry,formatted_address,name",
          language: "en",
        });

        if (query.sessionToken) {
          params.append("sessiontoken", query.sessionToken);
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`Google API responded with status ${response.status}`);
        }

        const data: GoogleApiResponse = await response.json();

        if (data.status !== "OK") {
          console.error("Google Place Details API error:", data.status, data.error_message);
          set.status = 500;
          return { error: "Failed to fetch place details" };
        }

        const result = data.result;
        const lat = result.geometry?.location?.lat;
        const lng = result.geometry?.location?.lng;

        if (typeof lat !== "number" || typeof lng !== "number") {
          set.status = 400;
          return { error: "Could not get coordinates for this place" };
        }

        if (!isWithinChennai(lat, lng)) {
          set.status = 400;
          return { error: "Location must be within Chennai city limits" };
        }

        return {
          name: result.name || result.formatted_address,
          formattedAddress: result.formatted_address,
          lat,
          lng,
        };
      } catch (error) {
        console.error("Error fetching place details:", error);
        set.status = 500;
        return { error: "Failed to fetch place details" };
      }
    },
    {
      query: t.Object({
        placeId: t.String(),
        sessionToken: t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/reverse-geocode",
    async ({ query, set }) => {
      const apiKey = process.env.GOOGLE_MAPS_FRONTEND_KEY;
      if (!apiKey) {
        set.status = 500;
        return { error: "Maps API not configured" };
      }

      const latNum = parseFloat(query.lat);
      const lngNum = parseFloat(query.lng);

      if (isNaN(latNum) || isNaN(lngNum)) {
        set.status = 400;
        return { error: "Valid lat and lng are required" };
      }

      if (!isWithinChennai(latNum, lngNum)) {
        set.status = 400;
        return { error: "Location must be within Chennai city limits" };
      }

      try {
        const params = new URLSearchParams({
          latlng: `${latNum},${lngNum}`,
          key: apiKey,
          language: "en",
          result_type: "street_address|route|neighborhood|sublocality|locality",
        });

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`Google Geocoding API responded with status ${response.status}`);
        }

        const data: GoogleApiResponse = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          console.error("Google Geocoding API error:", data.status, data.error_message);
          set.status = 500;
          return { error: "Failed to reverse geocode" };
        }

        if (!data.results || data.results.length === 0) {
          return {
            name: `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`,
            formattedAddress: null,
          };
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
            (c: { types: string[]; long_name: string }) => c.types.includes(priority),
          );
          if (component) {
            name = component.long_name;
            break;
          }
        }

        return { name, formattedAddress: result.formatted_address };
      } catch (error) {
        console.error("Error reverse geocoding:", error);
        set.status = 500;
        return { error: "Failed to reverse geocode" };
      }
    },
    {
      query: t.Object({
        lat: t.String(),
        lng: t.String(),
      }),
    },
  );
