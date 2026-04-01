"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the map component with SSR disabled
// as Mapbox depends on window/browser APIs
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "calc(100vh - var(--nav-height))", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="skeleton" style={{ width: "100%", height: "100%" }}></div>
      <span style={{ position: "absolute", color: "var(--teal)", fontWeight: "bold" }} className="animate-pulse">Loading Map Engine...</span>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div style={{ height: "calc(100vh - var(--nav-height))", position: "relative" }}>
      <Suspense fallback={<div>Loading Map...</div>}>
        <MapView />
      </Suspense>
    </div>
  );
}
