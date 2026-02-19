import { useState, useEffect, useCallback } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { Loader2, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import type { LocationValue } from "@ullatchi/types";

// Chennai bounds and center
const CHENNAI_BOUNDS = {
  north: 13.25,
  south: 12.85,
  east: 80.35,
  west: 80.05,
};

const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };

interface InteractiveMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLocation?: { lat: number; lng: number };
  onSelect: (location: LocationValue) => void;
}

export function InteractiveMapModal({
  open,
  onOpenChange,
  initialLocation,
  onSelect,
}: InteractiveMapModalProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(initialLocation || null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Fetch API key when modal opens
  useEffect(() => {
    if (open && !apiKey && !isLoadingKey) {
      setIsLoadingKey(true);
      setKeyError(null);

      fetch(apiUrl("/api/maps/key"))
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load map");
          return res.json();
        })
        .then((data) => {
          setApiKey(data.key);
        })
        .catch((err) => {
          console.error("Failed to fetch API key:", err);
          setKeyError("Failed to load map. Please try again.");
        })
        .finally(() => {
          setIsLoadingKey(false);
        });
    }
  }, [open, apiKey, isLoadingKey]);

  // Reset marker when modal opens with initial location
  useEffect(() => {
    if (open) {
      setMarkerPosition(initialLocation || null);
      setLocationName(null);
    }
  }, [open, initialLocation]);

  // Reverse geocode when marker position changes
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
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
        throw new Error(data.error || "Failed to get location name");
      }

      const data = await response.json();
      setLocationName(data.name);
    } catch (err) {
      console.error("Reverse geocode error:", err);
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Check if position is within Chennai bounds
  const isWithinBounds = useCallback((lat: number, lng: number) => {
    return (
      lat >= CHENNAI_BOUNDS.south &&
      lat <= CHENNAI_BOUNDS.north &&
      lng >= CHENNAI_BOUNDS.west &&
      lng <= CHENNAI_BOUNDS.east
    );
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      const detail = event.detail;
      const lat = detail.latLng?.lat;
      const lng = detail.latLng?.lng;

      if (lat === undefined || lng === undefined) return;

      if (!isWithinBounds(lat, lng)) {
        alert("Please select a location within Chennai city limits");
        return;
      }

      setMarkerPosition({ lat, lng });
      reverseGeocode(lat, lng);
    },
    [isWithinBounds, reverseGeocode],
  );

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback(
    (event: google.maps.MapMouseEvent) => {
      const lat = event.latLng?.lat();
      const lng = event.latLng?.lng();

      if (lat === undefined || lng === undefined) return;

      if (!isWithinBounds(lat, lng)) {
        // Reset to previous position or center
        setMarkerPosition(initialLocation || CHENNAI_CENTER);
        alert("Location must be within Chennai city limits");
        return;
      }

      setMarkerPosition({ lat, lng });
      reverseGeocode(lat, lng);
    },
    [isWithinBounds, initialLocation, reverseGeocode],
  );

  const handleConfirm = () => {
    if (!markerPosition || !locationName) return;

    onSelect({
      name: locationName,
      geopoint: markerPosition,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Location on Map</DialogTitle>
          <DialogDescription>
            Click on the map to select a location within Chennai. You can drag
            the marker to adjust.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 relative rounded-lg overflow-hidden border border-input min-h-0">
          {isLoadingKey && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {keyError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-destructive">
              <MapPin className="w-12 h-12 mb-2" />
              <p>{keyError}</p>
            </div>
          )}

          {apiKey && (
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={initialLocation || CHENNAI_CENTER}
                defaultZoom={13}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapId="report-location-picker"
                onClick={handleMapClick}
                restriction={{
                  latLngBounds: CHENNAI_BOUNDS,
                  strictBounds: false,
                }}
                style={{ width: "100%", height: "100%" }}
              >
                {markerPosition && (
                  <AdvancedMarker
                    position={markerPosition}
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                  />
                )}
              </Map>
            </APIProvider>
          )}
        </div>

        {/* Selected Location Info */}
        {markerPosition && (
          <div className="px-3 py-2 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              {isGeocoding ? (
                <span className="text-muted-foreground">
                  Getting location name...
                </span>
              ) : (
                <span className="truncate">
                  {locationName || "Unknown location"}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!markerPosition || !locationName || isGeocoding}
          >
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
