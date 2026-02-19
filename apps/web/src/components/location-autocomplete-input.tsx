import { useState, useRef, useEffect } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useLocationAutocomplete,
  type LocationValue,
  type Prediction,
} from "@/lib/hooks/use-location-autocomplete";
import { StaticMapPreview } from "./static-map-preview";
import { InteractiveMapModal } from "./interactive-map-modal";

interface LocationAutocompleteInputProps {
  value: LocationValue | null;
  onChange: (location: LocationValue | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function LocationAutocompleteInput({
  value,
  onChange,
  placeholder = "Search for a location in Chennai...",
  disabled = false,
}: LocationAutocompleteInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    inputValue,
    setInputValue,
    predictions,
    isLoading,
    error,
    handleInputChange,
    selectPlace,
    clear,
  } = useLocationAutocomplete();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync input value with external value
  useEffect(() => {
    if (value?.name) {
      setInputValue(value.name);
    }
  }, [value, setInputValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    handleInputChange(newValue);
    setIsDropdownOpen(true);

    // If user clears input, clear the selected value
    if (!newValue.trim()) {
      onChange(null);
    }
  };

  const handleSelectPrediction = async (prediction: Prediction) => {
    const location = await selectPlace(prediction.placeId);
    if (location) {
      setInputValue(location.name);
      onChange(location);
    }
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    clear();
    onChange(null);
    setIsDropdownOpen(false);
  };

  const handleMapSelect = (location: LocationValue) => {
    setInputValue(location.name);
    onChange(location);
    setIsMapModalOpen(false);
  };

  const showDropdown =
    isDropdownOpen && (predictions.length > 0 || isLoading || error);

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="relative">
        <div className="relative flex items-center">
          <Input
            value={inputValue}
            onChange={handleInput}
            onFocus={() => predictions.length > 0 && setIsDropdownOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-20"
          />
          <div className="absolute right-1 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
            {value && !isLoading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleClear}
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMapModalOpen(true)}
              disabled={disabled}
              title="Select on map"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading && predictions.length === 0 && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  Searching...
                </span>
              </div>
            )}
            {error && (
              <div className="p-3 text-sm text-destructive">{error}</div>
            )}
            {predictions.map((prediction) => (
              <button
                key={prediction.placeId}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                onClick={() => handleSelectPrediction(prediction)}
              >
                <div className="font-medium text-sm">{prediction.mainText}</div>
                {prediction.secondaryText && (
                  <div className="text-xs text-muted-foreground">
                    {prediction.secondaryText}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Static Map Preview */}
      {value?.geopoint && (
        <StaticMapPreview
          lat={value.geopoint.lat}
          lng={value.geopoint.lng}
          name={value.name}
        />
      )}

      {/* Interactive Map Modal */}
      <InteractiveMapModal
        open={isMapModalOpen}
        onOpenChange={setIsMapModalOpen}
        initialLocation={value?.geopoint}
        onSelect={handleMapSelect}
      />
    </div>
  );
}
