"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import industries from "@/data/industries.json";

// Fix static paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface TracerMapProps {
  selectedReport: any;
}

// Particle Animator Sub-component
function ParticleAnimator({ report, targetLng, targetLat }: { report: any, targetLng: number, targetLat: number }) {
  const map = useMap();
  const markersRef = useRef<L.CircleMarker[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!report) return;

    // Center map slightly offset for the demo
    map.flyTo([report.latitude, report.longitude], 12, { duration: 1.5 });

    // Initialize markers
    const numParticles = 30;
    const particlesData = Array.from({length: numParticles}).map(() => ({
      lng: report.longitude + (Math.random() - 0.5) * 0.002,
      lat: report.latitude + (Math.random() - 0.5) * 0.002,
      age: 0,
      life: Math.random() * 80 + 80
    }));

    // Cleanup old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Add new map markers
    particlesData.forEach(p => {
      const m = L.circleMarker([p.lat, p.lng], {
        radius: 3,
        color: 'rgba(0, 210, 211, 0.2)',
        fillColor: 'rgba(0, 210, 211, 0.8)',
        fillOpacity: 1,
        weight: 1
      }).addTo(map);
      markersRef.current.push(m);
    });

    let frame = 0;
    const animate = () => {
      frame++;
      particlesData.forEach((p, idx) => {
        const dx = targetLng - report.longitude;
        const dy = targetLat - report.latitude;
        
        const noiseX = (Math.random() - 0.5) * 0.001;
        const noiseY = (Math.random() - 0.5) * 0.001;

        if (p.age < p.life) {
          p.lng += (dx / p.life) + noiseX;
          p.lat += (dy / p.life) + noiseY;
          p.age++;
        } else if (frame % 150 === 0) {
           p.lng = report.longitude + (Math.random() - 0.5) * 0.002;
           p.lat = report.latitude + (Math.random() - 0.5) * 0.002;
           p.age = 0;
           p.life = Math.random() * 80 + 80;
        }

        const marker = markersRef.current[idx];
        if (marker) {
          marker.setLatLng([p.lat, p.lng]);
          marker.setStyle({ fillOpacity: Math.max(0, 1 - (p.age/p.life)) });
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      markersRef.current.forEach(m => map.removeLayer(m));
    };
  }, [report, map, targetLat, targetLng]);

  return null;
}

const shipIcon = L.divIcon({
  html: '<div style="font-size: 24px; filter: drop-shadow(0 0 10px #ef4444); display: flex; align-items: center; justify-content: center; transform: translateY(-10px);">🚢</div>',
  className: "transparent-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

export default function TracerMap({ selectedReport }: TracerMapProps) {
  let targetLng = 0;
  let targetLat = 0;
  
  if (selectedReport) {
    targetLng = selectedReport.longitude - 0.05;
    targetLat = selectedReport.latitude + 0.02;

    if (selectedReport.isLive && selectedReport.vesselMatch) {
      targetLng = selectedReport.vesselMatch.longitude;
      targetLat = selectedReport.vesselMatch.latitude;
    } else if (selectedReport.sourceMatch) {
      const match = industries.find(i => i.name === selectedReport.sourceMatch);
      if (match) {
        targetLng = match.longitude;
        targetLat = match.latitude;
      }
    }
  }

  return (
    <div style={{ width: "100%", height: "100%", background: "var(--ocean-950)" }}>
      <MapContainer 
        center={[9.20, 79.15]} 
        zoom={10} 
        style={{ width: "100%", height: "100%", background: "var(--ocean-950)" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {industries.map((ind) => {
           let color = "#ffffff";
           if (ind.compliance === "RED") color = "#ef4444";
           if (ind.compliance === "YELLOW") color = "#f97316";
           if (ind.compliance === "GREEN") color = "#10b981";

           return (
             <CircleMarker
               key={ind.id}
               center={[ind.latitude, ind.longitude]}
               radius={6}
               pathOptions={{
                 color: color,
                 weight: 2,
                 fillColor: "#000",
                 fillOpacity: 1
               }}
             >
               <Popup className="custom-popup">
                 <div style={{ minWidth: "150px" }}>
                   <p style={{ marginBottom: "4px", color: "var(--text-primary)", fontWeight: "bold" }}>{ind.name}</p>
                   <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Type: {ind.dischargeType}</p>
                   <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Violations: {ind.pollutionFlags}</p>
                 </div>
               </Popup>
             </CircleMarker>
           );
        })}

        {selectedReport && (
          <>
            <CircleMarker
              center={[selectedReport.latitude, selectedReport.longitude]}
              radius={8}
              pathOptions={{
                color: "var(--amber)",
                weight: 2,
                fillColor: "var(--amber)",
                fillOpacity: 0.5,
                className: "animate-pulse"
              }}
            />
            {/* Universally render ship marker at target coordinates so particles always hit something visible */}
            <Marker 
              position={[targetLat, targetLng]}
              icon={shipIcon}
            >
              <Popup className="custom-popup">
                <div style={{ minWidth: "200px", padding: "4px" }}>
                  <span className="badge badge-coral" style={{ marginBottom: "8px", display: "inline-block" }}>
                    Radar Target
                  </span>
                  
                  {selectedReport.isLive && selectedReport.vesselMatch ? (
                    <>
                      <h4 style={{ color: "var(--text-primary)", marginBottom: "4px", fontSize: "1.1rem" }}>
                        {selectedReport.vesselMatch.name}
                      </h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "2px" }}>
                        Type: {selectedReport.vesselMatch.type}
                      </p>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px", fontFamily: "var(--font-mono)" }}>
                        MMSI: {selectedReport.vesselMatch.mmsi}
                      </p>
                      <a 
                        href={`https://www.marinetraffic.com/en/ais/home/centerx:${selectedReport.vesselMatch.longitude}/centery:${selectedReport.vesselMatch.latitude}/zoom:14`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ display: "block", textAlign: "center", textDecoration: "none", padding: "8px" }}
                      >
                        Track Vessel Real-Time
                      </a>
                    </>
                  ) : (
                    <>
                      <h4 style={{ color: "var(--text-primary)", marginBottom: "4px", fontSize: "1.1rem" }}>
                        {selectedReport.sourceMatch || "Unidentified Target"}
                      </h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>
                        {selectedReport.sourceMatch ? "Industrial facility identified from vector paths." : "Awaiting visual payload verification."}
                      </p>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
            <ParticleAnimator report={selectedReport} targetLng={targetLng} targetLat={targetLat} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
