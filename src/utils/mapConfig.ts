import L from "leaflet";

/**
 * OpenStreetMap Tile Layer Configuration
 * Complies with official OpenStreetMap Tile Usage Policy:
 * - Official HTTPS tile endpoint
 * - Visible, legally required attribution
 * - Interactive tile loading only (no prefetching or bulk scraping)
 */
export const OSM_TILE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_MAP_TILE_URL)
    ? import.meta.env.VITE_MAP_TILE_URL
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

export const OSM_MAX_ZOOM = 19;
export const OSM_MIN_ZOOM = 3;

/**
 * Sensible default coordinate anchor for UrbanPulse Guardian AI
 * Configured for Delhi NCR (New Delhi metro core) matching live project incident reports
 */
export const DEFAULT_MAP_CENTER: [number, number] = [28.6139, 77.2090];
export const DEFAULT_MAP_ZOOM = 12;

/**
 * Factory creating a standard OpenStreetMap TileLayer with resilient error handling.
 * Gracefully handles tile loading anomalies without throwing unhandled exceptions.
 */
export function createOsmTileLayer(options?: L.TileLayerOptions): L.TileLayer {
  const layer = L.tileLayer(OSM_TILE_URL, {
    maxZoom: OSM_MAX_ZOOM,
    minZoom: OSM_MIN_ZOOM,
    attribution: OSM_ATTRIBUTION,
    crossOrigin: true,
    ...options,
  });

  // Graceful degradation on network/tile errors without breaking the React UI
  layer.on("tileerror", (errorEvent) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[OpenStreetMap] Tile load notice:", errorEvent);
    }
  });

  return layer;
}
