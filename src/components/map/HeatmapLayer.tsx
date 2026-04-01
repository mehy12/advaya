import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

interface HeatmapProps {
  points: Array<{ lat: number; lng: number; weight: number }>;
  visible: boolean;
}

export default function HeatmapLayer({ points, visible }: HeatmapProps) {
  const map = useMap();

  useEffect(() => {
    if (!visible || !points.length) return;

    // Convert points to LatLng array with intensity
    // leaflet.heat expects [lat, lng, intensity]
    const heatPoints = points.map(p => [p.lat, p.lng, p.weight] as L.HeatLatLngTuple);

    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 14,
      gradient: {
        0.2: "rgba(59, 140, 196, 0.8)",
        0.4: "rgba(0, 210, 211, 0.8)",
        0.6: "rgba(255, 193, 7, 0.8)",
        0.8: "rgba(249, 115, 22, 0.8)",
        1.0: "rgba(239, 68, 68, 0.9)"
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, visible]);

  return null;
}
