"use client";

import { useEffect, useRef, useMemo } from "react";
import { Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { BuoyState } from "@/hooks/useBuoySimulation";

// ─── Buoy boat icon: glowing dot + pulse ring ──────────────────────────────

function makeBuoyIcon(selected: boolean) {
  const coreColor = selected ? "#0ea5e9" : "#64748b";
  const glowColor = selected ? "rgba(14,165,233,0.7)" : "rgba(100,116,139,0.4)";
  const pulseColor = selected ? "rgba(14,165,233,0.25)" : "rgba(100,116,139,0.15)";
  return L.divIcon({
    html: `
      <div style="position:relative;width:24px;height:24px;cursor:pointer;">
        <div style="
          position:absolute;inset:0;
          border-radius:50%;
          background:${pulseColor};
          animation:buoyPulse 2s ease-out infinite;
        "></div>
        <div style="
          position:absolute;top:6px;left:6px;
          width:12px;height:12px;
          border-radius:50%;
          background:${coreColor};
          border:2px solid #ffffff;
          box-shadow:0 0 12px ${glowColor};
        "></div>
      </div>
    `,
    className: "transparent-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// ─── Trail color by health score ────────────────────────────────────────────

function healthColor(score: number): string {
  if (score >= 70) return "#10B981";   // green
  if (score >= 50) return "#F59E0B";   // amber
  return "#DC2626";                     // red
}

// ─── Component ──────────────────────────────────────────────────────────────

interface BuoyLayerProps {
  buoy: BuoyState;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export default function BuoyLayer({ buoy, selected = false, onSelect }: BuoyLayerProps) {
  const markerRef = useRef<L.Marker | null>(null);
  const initialPos = useRef<[number, number]>([buoy.lat, buoy.lng]);

  const icon = useMemo(() => makeBuoyIcon(selected), [selected]);

  // Smoothly move existing marker instead of re-rendering properties 60fps
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([buoy.lat, buoy.lng]);
    }
  }, [buoy.lat, buoy.lng]);

  // Build trail segments (each segment colored by health)
  const trailSegments: { positions: [number, number][]; color: string }[] = [];
  if (selected && buoy.trail.length >= 2) {
    for (let i = 0; i < buoy.trail.length - 1; i++) {
      const p1 = buoy.trail[i];
      const p2 = buoy.trail[i + 1];
      const avgScore = (p1.healthScore + p2.healthScore) / 2;
      trailSegments.push({
        positions: [
          [p1.lat, p1.lng],
          [p2.lat, p2.lng],
        ],
        color: healthColor(avgScore),
      });
    }
  }

  // Fade opacity: older segments are more transparent
  const now = Date.now();
  const trailDuration = 10 * 60 * 1000;

  return (
    <>
      {/* Color-coded dotted trail — only when selected */}
      {trailSegments.map((seg, i) => {
        const age = now - buoy.trail[i].timestamp;
        const opacity = Math.max(0.2, 1 - age / trailDuration);
        return (
          <Polyline
            key={`trail-${buoy.id}-${i}`}
            positions={seg.positions}
            pathOptions={{
              color: seg.color,
              weight: 3,
              opacity,
              dashArray: "6 8",
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        );
      })}

      {/* Buoy marker */}
      <Marker
        position={initialPos.current}
        icon={icon}
        ref={markerRef}
        eventHandlers={{
          click: () => onSelect?.(buoy.id),
        }}
      >
        <Tooltip
          direction="top"
          offset={[0, -14]}
          opacity={1}
          className="buoy-tooltip"
        >
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid rgba(14,165,233,0.4)",
            color: "#334155",
            boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
            minWidth: "160px",
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#0c4a6e", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
              <span>🚢 {buoy.name}</span>
              <span style={{ color: healthColor(buoy.sensors.healthScore) }}>{buoy.sensors.healthScore}/100</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "6px" }}>
              📍 {buoy.currentZoneLabel}
            </div>
            <div style={{ fontSize: "0.7rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              <div>pH: <strong>{buoy.sensors.pH}</strong></div>
              <div>DO: <strong>{buoy.sensors.dissolvedO2}</strong></div>
              <div>Turb: <strong>{buoy.sensors.turbidity}</strong> NTU</div>
              <div>Temp: <strong>{buoy.sensors.temperature}</strong>°C</div>
            </div>
            {!selected && (
              <div style={{ marginTop: "6px", fontSize: "0.65rem", textAlign: "center", color: "#0ea5e9", borderTop: "1px solid #e2e8f0", paddingTop: "4px" }}>
                Click to monitor
              </div>
            )}
          </div>
        </Tooltip>
      </Marker>
    </>
  );
}
