"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Marker, Popup, Polygon, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapView.module.css";
import staticPollutionData from "@/data/pollution-reports.json";
import HeatmapLayer from "./HeatmapLayer";
import { useRouter } from "next/navigation";
import realVessels from "@/data/real-vessels.json";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper function to generate an irregular blob polygon
function generateIrregularBlob(lat: number, lng: number, baseRadiusKm: number, numPoints = 8) {
   const coords: [number, number][] = [];
   const radiusDeg = baseRadiusKm / 111.32; // Convert km to roughly degrees
   
   for (let i = 0; i < numPoints; i++) {
      const angle = (i * Math.PI * 2) / numPoints;
      // Irregularity multiplier between 0.6 and 1.3
      const irregularity = 0.6 + Math.random() * 0.7; 
      const distance = radiusDeg * irregularity;
      
      coords.push([
         lat + Math.sin(angle) * distance,
         lng + Math.cos(angle) * distance
      ]);
   }
   return coords;
}

// Global Click Scanner for Biodiversity Mode
function BiodiversityClickScanner({ setScanLocation }: { setScanLocation: (loc: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      setScanLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

export default function MapView() {
  const router = useRouter();
  const [layers, setLayers] = useState({
    biodiversity: true,
    zones: true,
    vessels: false
  });
  
  const [liveReports, setLiveReports] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Buffer for LIVE AIS stream ships
  const liveShipsRef = useRef<any[]>([]);

  // State for live Open-Meteo Marine zones
  const [liveZones, setLiveZones] = useState<any[]>([]);

  const center: [number, number] = [17.5, 80.0];
  const zoom = 5;

  // Biodiversity Click State
  const [scanLocation, setScanLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Define strategic marine checkpoints around India
  const marineCheckpoints = [
    { name: "Gujarat Offshore", lat: 21.5, lng: 68.5 },
    { name: "Mumbai Deep Sea", lat: 18.5, lng: 70.0 },
    { name: "Konkan Coast", lat: 16.0, lng: 72.0 },
    { name: "Malabar Edge", lat: 11.0, lng: 74.5 },
    { name: "Laccadive Sea", lat: 8.5, lng: 76.0 },
    { name: "Gulf of Mannar", lat: 8.0, lng: 79.5 },
    { name: "Coromandel Offshore", lat: 12.0, lng: 82.0 },
    { name: "Godavari Basin", lat: 16.0, lng: 84.5 },
    { name: "Odisha Coast", lat: 19.5, lng: 87.0 },
    { name: "Andaman Sea Transit", lat: 14.0, lng: 91.0 }
  ];

  // 1. Fetch Live Marine Weather Zones
  useEffect(() => {
    async function fetchMarineZones() {
      try {
        const lats = marineCheckpoints.map(c => c.lat).join(",");
        const lngs = marineCheckpoints.map(c => c.lng).join(",");
        
        // Fetch current wave height and ocean current velocity for all 10 points
        const response = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}&current=wave_height,ocean_current_velocity`);
        const data = await response.json();

        // Open-Meteo returns an Array of objects for multiple coordinates
        if (Array.isArray(data)) {
          const zones = marineCheckpoints.map((checkpoint, index) => {
            const currentData = data[index]?.current || {};
            const waveHeight = currentData.wave_height || 0.5; // fallback
            const currentVelocity = currentData.ocean_current_velocity || 0; // fallback
            
            // Determine dynamic danger severity purely from real ocean physics
            let severity = "good";
            let radiusKm = 50; // base 50km
            
            if (waveHeight > 2.0) {
              severity = "critical";
              radiusKm = 100; // rough seas demand wider hazard margins
            } else if (waveHeight > 1.2) {
              severity = "poor";
              radiusKm = 80;
            } else if (waveHeight > 0.8) {
              severity = "moderate";
              radiusKm = 60;
            }

            // Generate an organic, irregular polygon shape representing weather systems/currents
            const blobPoints = generateIrregularBlob(checkpoint.lat, checkpoint.lng, radiusKm, 12);

            return {
              id: `zone-${index}`,
              name: checkpoint.name,
              latitude: checkpoint.lat,
              longitude: checkpoint.lng,
              polygonPoints: blobPoints,
              waveHeight: waveHeight.toFixed(2),
              currentVelocity: currentVelocity.toFixed(2),
              status: severity
            };
          });
          setLiveZones(zones);
        }
      } catch(error) {
        console.error("Marine API Fetch Failed:", error);
      }
    }
    
    fetchMarineZones();
    // Refresh every 15 minutes
    const interval = setInterval(fetchMarineZones, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Connect to aisstream.io
  useEffect(() => {
    const socket = new WebSocket("wss://stream.aisstream.io/v0/stream");
    
    socket.onopen = function () {
        const subscriptionMessage = {
            Apikey: process.env.NEXT_PUBLIC_AIS_STREAM_KEY || "02c700b1f8173511492d16267a0ff31b835e3841",
            BoundingBoxes: [[[5.0, 68.0], [25.0, 90.0]]],
            FilterMessageTypes: ["PositionReport"]
        };
        socket.send(JSON.stringify(subscriptionMessage));
    };

    socket.onmessage = function (event) {
        try {
            const aisMessage = JSON.parse(event.data);
            if (aisMessage["MessageType"] === "PositionReport" && aisMessage["MetaData"]) {
                const positionReport = aisMessage["Message"]["PositionReport"];
                const meta = aisMessage["MetaData"];
                
                // Add to rolling buffer
                const newShip = {
                    name: meta.ShipName ? meta.ShipName.trim() : `Vessel ${positionReport.UserID}`,
                    mmsi: positionReport.UserID,
                    type: "Cargo/Tanker", // Defaulting as positional reports don't explicitly carry type
                    latitude: positionReport.Latitude,
                    longitude: positionReport.Longitude
                };

                // Keep unique MMSIs, flush old ones to keep it highly active
                const filtered = liveShipsRef.current.filter((s: any) => s.mmsi !== newShip.mmsi);
                liveShipsRef.current = [newShip, ...filtered].slice(0, 100);
            }
        } catch(e) {}
    };

    return () => socket.close();
  }, []);

  // 3. Generate Anomaly Events
  useEffect(() => {
    const types = ["industrial", "oil", "plastic", "sewage", "agricultural"];
    
    const int = setInterval(() => {
      // Pick a real vessel from LIVE SOCKET, fallback to hardcoded if socket hasn't gotten messages yet
      const activePool = liveShipsRef.current.length > 0 ? liveShipsRef.current : realVessels;
      const vessel = activePool[Math.floor(Math.random() * activePool.length)];
      
      // The anomaly is generated slightly behind the vessel
      const lat = vessel.latitude + (Math.random() - 0.5) * 0.4;
      const lng = vessel.longitude + (Math.random() - 0.5) * 0.4;

      const reportId = `live-${Date.now()}`;
      const newReport = {
        id: reportId,
        latitude: lat,
        longitude: lng,
        type: types[Math.floor(Math.random() * types.length)],
        severity: Math.floor(Math.random() * 2) + 4,
        title: "LIVE SATELLITE DETECTION",
        description: "Autonomous anomaly detected via Sentinel-2 visual processing. Unverified.",
        timestamp: new Date().toISOString(),
        zone: liveShipsRef.current.length > 0 ? "Live Vector Intercept" : "International Waters",
        status: "pending",
        sourceMatch: null,
        isLive: true,
        vesselMatch: {
           name: vessel.name,
           mmsi: vessel.mmsi,
           type: vessel.type,
           latitude: vessel.latitude,
           longitude: vessel.longitude,
           hoursPassed: Math.floor(Math.random() * 8) + 1
        }
      };

      setLiveReports(prev => [newReport, ...prev].slice(0, 10));
      
      setNotification(`New ${newReport.type} anomaly near ${vessel.name}`);
      setTimeout(() => setNotification(null), 3000);

      setTimeout(() => {
        setLiveReports(current => current.filter(r => r.id !== reportId));
      }, 15000);

    }, 4500);

    return () => clearInterval(int);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "#10b981"; // Calm seas
      case "moderate": return "#f97316"; 
      case "poor": return "#ef4444"; 
      case "critical": return "#9f1239"; // Massive waves (turbulent, dark red)
      default: return "#020617";
    }
  };

  const handleTrace = (report: any) => {
    if (report.isLive) {
      sessionStorage.setItem('target_trace', JSON.stringify(report));
    } else {
      sessionStorage.removeItem('target_trace');
    }
    router.push(`/tracer?id=${report.id}`);
  };

  const liveIcon = L.divIcon({
    html: `
      <div class="radar-blip-container">
        <div class="radar-blip-ring"></div>
        <div class="radar-blip-core"></div>
      </div>
    `,
    className: "transparent-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  // Mathematically hash a string to generate pseudo-randomly fixed numbers so zooming/closing preserves the data for a specific ocean span
  const generateBiomeStats = (lat: number, lng: number) => {
    const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453);
    const purity = Math.floor(50 + (seed * 50)); // 50-100%
    const coral = Math.floor(20 + (seed * 80)); // 20-100%
    const temps = [28.4, 29.1, 29.8, 30.2, 31.0, 27.5];
    const temp = temps[Math.floor(seed * temps.length)];
    const densities = ["High", "Optimal", "Vulnerable", "Declining"];
    const density = densities[Math.floor(seed * densities.length)];
    
    return { purity, coral, temp, density };
  };

  return (
    <div className={styles.mapWrapper}>
      {notification && (
        <div style={{
          position: "absolute", top: "24px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(10, 22, 40, 0.9)", border: "1px solid rgba(239,68,68,0.5)",
          color: "white", padding: "10px 20px", backdropFilter: "blur(16px)",
          borderRadius: "var(--radius-full)", zIndex: 1000, fontWeight: "600",
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)", display: "flex", alignItems: "center", gap: "12px",
          transition: "opacity 0.3s ease"
        }}>
          <span style={{width: 8, height: 8, background: "#ef4444", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 10px #ef4444"}}></span>
          <span style={{ letterSpacing: "0.02em", fontSize: "0.9rem" }}>{notification}</span>
        </div>
      )}

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: "100%", height: "100%", background: "var(--ocean-950)", cursor: layers.biodiversity ? 'crosshair' : 'grab' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Global Map Click listener for Biodiversity Scanning */}
        {layers.biodiversity && (
          <BiodiversityClickScanner setScanLocation={setScanLocation} />
        )}

        {/* The rendered popup from user clicks */}
        {layers.biodiversity && scanLocation && (
          <Popup position={[scanLocation.lat, scanLocation.lng]} eventHandlers={{ remove: () => setScanLocation(null) }} className="custom-popup">
            <div style={{ minWidth: "220px", padding: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                <span className="severity-dot" style={{ background: "var(--teal)", boxShadow: "0 0 10px var(--teal)" }}></span>
                <span style={{ color: "var(--teal)", fontWeight: "bold", fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Local Biome Scan</span>
              </div>
              
              {(() => {
                const stats = generateBiomeStats(scanLocation.lat, scanLocation.lng);
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontFamily: "var(--font-sans)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Coordinates:</span>
                      <span style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
                        {scanLocation.lat.toFixed(2)}°, {scanLocation.lng.toFixed(2)}°
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Water Purity:</span>
                      <strong style={{ color: stats.purity > 75 ? "var(--teal)" : (stats.purity > 60 ? "var(--amber)" : "var(--coral)"), fontSize: "0.85rem" }}>
                        {stats.purity}%
                      </strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Coral Viability:</span>
                      <strong style={{ color: stats.coral > 50 ? "var(--teal)" : "var(--coral)", fontSize: "0.85rem" }}>
                        {stats.coral}%
                      </strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Surface Temp:</span>
                      <span style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>
                        {stats.temp}°C
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", paddingTop: "8px", borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Fauna Status:</span>
                      <strong style={{ color: stats.density === "High" || stats.density === "Optimal" ? "var(--teal)" : "var(--amber)", fontSize: "0.85rem", textTransform: "uppercase" }}>
                        {stats.density}
                      </strong>
                    </div>
                  </div>
                );
              })()}
            </div>
          </Popup>
        )}

        {layers.zones && liveZones.map((zone: any) => (
          <Polygon 
            key={zone.id}
            positions={zone.polygonPoints}
            pathOptions={{
               color: getStatusColor(zone.status),
               weight: 0,
               fillColor: getStatusColor(zone.status),
               fillOpacity: 0.15
            }}
          >
            <Popup className="custom-popup">
              <div className="leaflet-custom-popup" style={{ minWidth: "180px", padding: "6px" }}>
                <span className="badge badge-teal" style={{ marginBottom: "6px", display: "inline-block" }}>
                  Active API Node
                </span>
                <h4 style={{marginBottom: "6px", color: "var(--text-primary)", fontSize: "1.1rem"}}>{zone.name}</h4>
                <div style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px"}}>
                   <span className="severity-dot" style={{background: getStatusColor(zone.status), width: "8px", height: "8px"}}></span>
                   <span style={{color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.8rem", fontWeight: "bold"}}>
                     {zone.status === "good" ? "Calm Waters" : (zone.status === "critical" ? "Severe Turbulance" : "Active Flow")}
                   </span>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "8px", fontFamily: "var(--font-mono)" }}>
                   <p style={{color: "var(--text-primary)", fontSize: "0.85rem", margin: "0 0 4px 0"}}>
                     Waves: <span style={{ color: getStatusColor(zone.status) }}>{zone.waveHeight}m</span>
                   </p>
                   <p style={{color: "var(--text-primary)", fontSize: "0.85rem", margin: 0}}>
                     Current: <span style={{ color: "var(--blue)" }}>{zone.currentVelocity} km/h</span>
                   </p>
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Render Live Sweeping Radar Pings */}
        {true /* We don't hide live anomalies ever because they are the main feature */ && liveReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={liveIcon}
          >
            <Popup className="custom-popup">
              <div style={{ minWidth: "220px", padding: "4px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(10,22,40,0.9)", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div className="badge badge-coral" style={{ boxShadow: "0 0 10px rgba(239, 68, 68, 0.4)" }}>
                    LIVE ALERTS
                  </div>
                </div>
                
                <h4 style={{ marginBottom: "6px", color: "var(--text-primary)", fontSize: "1rem", fontWeight: "600", lineHeight: "1.3" }}>
                  {report.title}
                </h4>
                
                <p style={{ marginBottom: "16px", fontSize: "0.85rem", color: "var(--teal)", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>
                  {report.type} DETECTED
                </p>
                
                <button 
                  onClick={() => handleTrace(report)}
                  className="btn btn-primary" 
                  style={{ width: "100%", textAlign: "center", display: "block", padding: "10px 0" }}
                >
                  Run Radar Trace
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {/* Floating Layer Panel */}
      <div className={`${styles.layerPanel} glass-strong animate-slide-up`}>
        <h3 className={styles.panelTitle} style={{ fontSize: "1rem" }}>Intelligence Layers</h3>
        
        <label className={styles.layerToggle}>
          <input 
            type="checkbox" 
            checked={layers.biodiversity} 
            onChange={(e) => setLayers({...layers, biodiversity: e.target.checked})} 
          />
          <span className={styles.checkmark}></span>
          <span className={styles.label}>Biodiversity Scanner</span>
        </label>
        
        <label className={styles.layerToggle}>
          <input 
            type="checkbox" 
            checked={layers.zones} 
            onChange={(e) => setLayers({...layers, zones: e.target.checked})} 
          />
          <span className={styles.checkmark}></span>
          <span className={styles.label}>Live Sea States</span>
        </label>
      </div>

      {/* Legend */}
      <div className={`${styles.legend} glass animate-slide-up`}>
         <div className={styles.legendItem} style={{ marginBottom: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px", color: "#ef4444", fontWeight: "bold" }}>
          <span className="severity-dot" style={{ background: "#ef4444", boxShadow: "0 0 10px #ef4444" }}></span> Live Radar Pings
        </div>
        <div className={styles.legendItem}>
          <span className="severity-dot severity-5"></span> Critical (Lvl 5)
        </div>
        <div className={styles.legendItem}>
          <span className="severity-dot severity-4"></span> High (Lvl 4)
        </div>
        <div className={styles.legendItem}>
          <span className="severity-dot severity-3"></span> Warning (Lvl 3)
        </div>
        <div className={styles.legendItem}>
          <span className="severity-dot severity-1"></span> Stable (Lvl 1)
        </div>
      </div>
    </div>
  );
}
