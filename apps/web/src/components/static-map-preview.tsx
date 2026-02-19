import { useState } from "react";
import { MapPin } from "lucide-react";

interface StaticMapPreviewProps {
  lat: number;
  lng: number;
  name?: string;
  className?: string;
}

export function StaticMapPreview({
  lat,
  lng,
  name,
  className = "",
}: StaticMapPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const mapUrl = `/api/maps/static?lat=${lat}&lng=${lng}&zoom=15&size=400x200`;

  return (
    <div
      className={`rounded-lg overflow-hidden border border-input ${className}`}
    >
      {/* Map Image */}
      <div className="relative w-full h-32 bg-muted">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <MapPin className="w-8 h-8 mb-2" />
            <span className="text-sm">Map preview unavailable</span>
          </div>
        ) : (
          <img
            src={mapUrl}
            alt={`Map showing ${name || "selected location"}`}
            className={`w-full h-full object-cover transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </div>

      {/* Location Name */}
      {name && (
        <div className="px-3 py-2 bg-muted/50">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{name}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}
