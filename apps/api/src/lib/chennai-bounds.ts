export const CHENNAI_BOUNDS = {
  north: 13.25,
  south: 12.85,
  east: 80.35,
  west: 80.05,
};

export const CHENNAI_CENTER = {
  lat: 13.0827,
  lng: 80.2707,
};

export function isWithinChennai(lat: number, lng: number): boolean {
  return (
    lat >= CHENNAI_BOUNDS.south &&
    lat <= CHENNAI_BOUNDS.north &&
    lng >= CHENNAI_BOUNDS.west &&
    lng <= CHENNAI_BOUNDS.east
  );
}
