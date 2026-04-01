"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapView.module.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// River mouth pollution channels (Kochi-specific)
const RIVER_MOUTHS = [
  { name: "Periyar River Mouth", lat: 10.10, lng: 76.22, severity: "critical", color: "#DC2626" },
  { name: "Muvattupuzha Outlet", lat: 9.93, lng: 76.27, severity: "high", color: "#EA580C" },
  { name: "Edapally Canal", lat: 10.02, lng: 76.23, severity: "high", color: "#EA580C" },
  { name: "Chitrapuzha River", lat: 10.06, lng: 76.22, severity: "medium", color: "#F59E0B" },
  { name: "Vembanad Outlet", lat: 9.88, lng: 76.32, severity: "medium", color: "#F59E0B" },
];

// Fishing zones with water quality (Kochi)
const FISHING_ZONES = [
  { name: "Chellanam Coast", lat: 9.85, lng: 76.20, waterQuality: 45 },
  { name: "Fort Kochi", lat: 9.96, lng: 76.14, waterQuality: 72 },
  { name: "Munambam", lat: 10.18, lng: 76.17, waterQuality: 58 },
  { name: "Vypeen Island", lat: 10.08, lng: 76.16, waterQuality: 68 },
  { name: "Puthuvype", lat: 10.12, lng: 76.17, waterQuality: 52 },
];

// Bounds enforcer for Kochi
function BoundsEnforcer() {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([[9.6, 75.8], [10.3, 76.6]]);
    map.setMaxBounds(bounds);
    map.on("drag", () => {
      map.panInsideBounds(bounds, { animate: false });
    });
  }, [map]);
  return null;
}

// Water quality color scale
function getWaterQualityColor(score: number): string {
  if (score >= 70) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#DC2626";
}

function getWaterQualityStatus(score: number): string {
  if (score >= 70) return "Good";
  if (score >= 50) return "Moderate";
  return "Poor";
}

// Severity dot icon for river mouths
const createSeverityIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color};" />`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: "transparent-icon",
  });

export default function MapView() {
  const [showSatellite, setShowSatellite] = useState(false);
  const [userReports, setUserReports] = useState<any[]>([]);

  // Load user reports from localStorage
  useEffect(() => {
    const loadReports = () => {
      if (typeof window !== "undefined") {
        const saved = JSON.parse(localStorage.getItem("neptune_user_reports") || "[]");
        setUserReports(saved);
      }
    };
    loadReports();
    const interval = setInterval(loadReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const deleteCitizenReport = (reportId: string) => {
    if (typeof window === "undefined") return;
    const remaining = userReports.filter((report) => report.id !== reportId);
    setUserReports(remaining);
    localStorage.setItem("neptune_user_reports", JSON.stringify(remaining));
  };

  const kochiBounds: [number, number][] = [[9.6, 75.8], [10.3, 76.6]];
  const kochiCenter: [number, number] = [9.98, 76.22];

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={kochiCenter}
        zoom={11}
        minZoom={10}
        maxZoom={18}
        maxBounds={kochiBounds}
        style={{ width: "100%", height: "100%", background: "#0f0f0f" }}
        zoomControl={false}
      >
        {/* CARTO Dark base layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={20}
          zIndex={1}
        />

        {/* NASA GIBS satellite overlay (toggleable) */}
        {showSatellite && (
          <TileLayer
            url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg"
            attribution="NASA GIBS"
            opacity={0.65}
            zIndex={2}
            date={new Date().toISOString().split("T")[0]}
          />
        )}

        <BoundsEnforcer />

        {/* River mouth pollution channels */}
        {RIVER_MOUTHS.map((river) => (
          <Marker
            key={river.name}
            position={[river.lat, river.lng]}
            icon={createSeverityIcon(river.color)}
          >
            <Popup className="custom-popup">
              <div style={{ minWidth: "200px", padding: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: river.color,
                      boxShadow: `0 0 8px ${river.color}`,
                    }}
                  />
                  <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)" }}>
                    {river.name}
                  </span>
                </div>
                <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Pollution Channel
                </p>
                <div
                  style={{
                    background: "var(--slate-100)",
                    padding: "6px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Status: <strong>{river.severity.toUpperCase()}</strong>
                  <br />
                  Coord: {river.lat.toFixed(4)}, {river.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fishing zones with water quality circles */}
        {FISHING_ZONES.map((zone) => {
          const qualityColor = getWaterQualityColor(zone.waterQuality);
          const qualityStatus = getWaterQualityStatus(zone.waterQuality);
          return (
            <Circle
              key={zone.name}
              center={[zone.lat, zone.lng]}
              radius={2000}
              pathOptions={{
                color: qualityColor,
                fillColor: qualityColor,
                fillOpacity: 0.2,
                weight: 2,
              }}
            >
              <Popup className="custom-popup">
                <div style={{ minWidth: "220px", padding: "8px" }}>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>
                    {zone.name}
                  </h4>
                  <div
                    style={{
                      background: qualityColor,
                      color: qualityStatus === "Good" ? "#047857" : "#000",
                      padding: "8px",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Water Quality: {qualityStatus}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <p style={{ margin: "0 0 4px 0" }}>
                      <strong>Score:</strong> {zone.waterQuality}/100
                    </p>
                    <p style={{ margin: "0 0 4px 0" }}>
                      <strong>Zone:</strong> Fishing Area
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Coord:</strong> {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Citizen reports */}
        {userReports.map((report) => (
          <Marker key={report.id} position={[report.latitude, report.longitude]}>
            <Popup className="custom-popup">
              <div style={{ minWidth: "220px", padding: "8px", background: "#ffffff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="badge" style={{ background: "var(--teal)", color: "white", fontSize: "0.7rem" }}>
                    CITIZEN REPORT
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--slate-400)" }}>
                    {new Date(report.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {report.imageBase64 && (
                  <div style={{ marginBottom: "8px", border: "1px solid var(--slate-200)", borderRadius: "4px", overflow: "hidden" }}>
                    <img
                      src={report.imageBase64}
                      alt="Report evidence"
                      style={{ width: "100%", maxHeight: "120px", objectFit: "cover" }}
                    />
                  </div>
                )}
                <h4 style={{ margin: "0 0 4px 0", color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: "600" }}>
                  {report.type}
                </h4>
                <p style={{ margin: "0 0 8px 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {report.description}
                </p>
                <div style={{ padding: "6px", background: "var(--slate-50)", border: "1px solid var(--slate-100)", fontSize: "0.75rem", borderRadius: "3px", marginBottom: "8px" }}>
                  Verified by: <strong>NeptuneGuard AI</strong>
                </div>
                {report.isUserReport && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Delete this citizen report?")) {
                        deleteCitizenReport(report.id);
                      }
                    }}
                    className="btn btn-secondary"
                    style={{
                      width: "100%",
                      padding: "6px",
                      fontSize: "0.8rem",
                      color: "var(--red)",
                      border: "1px solid var(--red)",
                    }}
                  >
                    Delete Report
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Layer toggle */}
      <div className={styles.layerPanel}>
        <h3 className={styles.panelTitle}>Map Layers</h3>
        <label className={styles.layerToggle}>
          <input
            type="checkbox"
            checked={showSatellite}
            onChange={(e) => setShowSatellite(e.target.checked)}
          />
          <span className={styles.checkmark}></span>
          <span className={styles.label}>NASA Satellite (65%)</span>
        </label>

        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 8px 0", fontWeight: "600" }}>
            ACTIVE LAYERS:
          </p>
          <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <li>River Mouth Pollution Channels (5)</li>
            <li>Fishing Zone Water Quality (5)</li>
            <li>Citizen Anomaly Reports</li>
          </ul>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)" }}>
          Legend
        </h4>

        <div style={{ marginBottom: "12px", borderBottom: "1px solid var(--slate-200)", paddingBottom: "10px" }}>
          <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)" }}>
            River Mouths
          </p>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  background: "#DC2626",
                  borderRadius: "50%",
                }}
              />
              Critical
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  background: "#EA580C",
                  borderRadius: "50%",
                }}
              />
              High
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  background: "#F59E0B",
                  borderRadius: "50%",
                }}
              />
              Medium
            </div>
          </div>
        </div>

        <div>
          <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)" }}>
            Fishing Zones
          </p>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  background: "#10B981",
                  borderRadius: "50%",
                }}
              />
              Good (70+)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  background: "#F59E0B",
                  borderRadius: "50%",
                }}
              />
              Moderate (50-69)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  background: "#DC2626",
                  borderRadius: "50%",
                }}
              />
              Poor (&lt;50)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
