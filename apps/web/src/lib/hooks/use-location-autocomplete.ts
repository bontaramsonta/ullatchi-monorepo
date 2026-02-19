import { useState, useCallback, useRef, useEffect } from "react";
import { apiUrl } from "@/lib/api";
import type { Prediction, LocationValue } from "@ullatchi/types";

export type { Prediction, LocationValue };

interface UseLocationAutocompleteOptions {
  debounceMs?: number;
}

export function useLocationAutocomplete(
  options: UseLocationAutocompleteOptions = {},
) {
  const { debounceMs = 300 } = options;

  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session token for Google Places billing optimization
  const sessionTokenRef = useRef<string>(crypto.randomUUID());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Regenerate session token (call after selecting a place)
  const regenerateSessionToken = useCallback(() => {
    sessionTokenRef.current = crypto.randomUUID();
  }, []);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setPredictions([]);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        input: query,
        sessionToken: sessionTokenRef.current,
      });

      const response = await fetch(
        apiUrl(`/api/places/autocomplete?${params.toString()}`),
        {
          signal: abortControllerRef.current.signal,
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch suggestions");
      }

      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Ignore abort errors
      }
      console.error("Autocomplete error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch suggestions",
      );
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced input handler
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, debounceMs);
    },
    [debounceMs, fetchSuggestions],
  );

  // Fetch place details and return location
  const selectPlace = useCallback(
    async (placeId: string): Promise<LocationValue | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          placeId,
          sessionToken: sessionTokenRef.current,
        });

        const response = await fetch(
          apiUrl(`/api/places/details?${params.toString()}`),
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch place details");
        }

        const data = await response.json();

        // Regenerate session token after successful selection
        regenerateSessionToken();

        // Clear predictions
        setPredictions([]);

        return {
          name: data.name,
          geopoint: {
            lat: data.lat,
            lng: data.lng,
          },
        };
      } catch (err) {
        console.error("Place details error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch place details",
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [regenerateSessionToken],
  );

  // Reverse geocode coordinates to get place name
  const reverseGeocode = useCallback(
    async (
      lat: number,
      lng: number,
    ): Promise<{ name: string; formattedAddress: string | null } | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          lat: lat.toString(),
          lng: lng.toString(),
        });

        const response = await fetch(
          apiUrl(`/api/places/reverse-geocode?${params.toString()}`),
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to reverse geocode");
        }

        return await response.json();
      } catch (err) {
        console.error("Reverse geocode error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to reverse geocode",
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Clear everything
  const clear = useCallback(() => {
    setInputValue("");
    setPredictions([]);
    setError(null);
    regenerateSessionToken();
  }, [regenerateSessionToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    inputValue,
    setInputValue,
    predictions,
    isLoading,
    error,
    handleInputChange,
    selectPlace,
    reverseGeocode,
    clear,
  };
}
