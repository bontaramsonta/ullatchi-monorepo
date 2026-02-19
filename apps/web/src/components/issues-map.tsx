import { useState, useEffect, useCallback } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { Loader2, MapPin } from "lucide-react";
import { apiUrl } from "@/lib/api";
import type { ReportWithCategory } from "@/lib/queries/sanity-reports";

const CHENNAI_BOUNDS = {
  north: 13.25,
  south: 12.85,
  east: 80.35,
  west: 80.05,
};

const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };

interface IssuesMapProps {
  reports: ReportWithCategory[];
}

export function IssuesMap({ reports }: IssuesMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  const reportsWithLocation = reports.filter(
    (r) =>
      r.location?.geopoint?.lat != null &&
      r.location?.geopoint?.lng != null &&
      typeof r.location.geopoint.lat === "number" &&
      typeof r.location.geopoint.lng === "number",
  );

  useEffect(() => {
    if (!apiKey && !isLoadingKey) {
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
  }, [apiKey, isLoadingKey]);

  const handleMarkerClick = useCallback((reportId: string) => {
    const el = document.getElementById(reportId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  if (isLoadingKey) {
    return (
      <div className="relative flex h-48 w-full items-center justify-center rounded-lg border bg-muted/50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (keyError) {
    return (
      <div className="space-y-3">
        <div className="relative flex h-48 w-full flex-col items-center justify-center rounded-lg border bg-muted/50 text-destructive">
          <MapPin className="h-8 w-8 text-destructive/70" />
          <p className="mt-2 text-sm">{keyError}</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="relative h-48 w-full overflow-hidden rounded-lg border">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={CHENNAI_CENTER}
            defaultZoom={12}
            gestureHandling="cooperative"
            mapId="issues-map"
            restriction={{
              latLngBounds: CHENNAI_BOUNDS,
              strictBounds: false,
            }}
            fullscreenControl={false}
            streetViewControl={false}
            style={{ width: "100%", height: "100%" }}
          >
            {reportsWithLocation.map((report) => {
              const lat = report.location!.geopoint!.lat as number;
              const lng = report.location!.geopoint!.lng as number;
              return (
                <AdvancedMarker
                  key={report._id}
                  position={{ lat, lng }}
                  onClick={() => handleMarkerClick(report._id)}
                />
              );
            })}
          </Map>
        </APIProvider>
      </div>
      {reportsWithLocation.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Click a marker to jump to that report.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          No reports with location data yet.
        </p>
      )}
    </div>
  );
}
