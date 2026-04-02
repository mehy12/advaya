"use client";

import { useEffect, useState } from "react";
import type { BuoyState, SensorReading } from "@/hooks/useBuoySimulation";
import styles from "./BuoyPanel.module.css";

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusIcon(value: number, goodMin: number, goodMax: number, warnMin: number, warnMax: number): string {
  if (value >= goodMin && value <= goodMax) return "✅";
  if (value >= warnMin && value <= warnMax) return "⚠️";
  return "🔴";
}

function healthColor(score: number): string {
  if (score >= 70) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#DC2626";
}

function healthLabel(score: number): string {
  if (score >= 70) return "GOOD";
  if (score >= 50) return "MODERATE";
  return "POOR";
}

function sparkColor(score: number): string {
  if (score >= 70) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#DC2626";
}

// ─── Sparkline ──────────────────────────────────────────────────────────────

function Sparkline({ values, color, max }: { values: number[]; color: string; max: number }) {
  const effectiveMax = max || Math.max(...values, 1);
  return (
    <div className={styles.sparkline}>
      {values.map((v, i) => (
        <div
          key={i}
          className={styles.sparkBar}
          style={{
            height: `${Math.max(8, (v / effectiveMax) * 100)}%`,
            background: color,
            opacity: 0.4 + (i / values.length) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

// ─── Alert Toast ────────────────────────────────────────────────────────────

function BuoyAlertToast() {
  const [alert, setAlert] = useState<{
    buoyName: string;
    zone: string;
    healthScore: number;
  } | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      const detail = e.detail;
      setAlert({
        buoyName: detail.buoyName,
        zone: detail.zone,
        healthScore: detail.healthScore,
      });

      // Also fire the global neptune-notification event for the existing notification bar
      const notifEvent = new CustomEvent("neptune-notification", {
        detail: `⚠️ ${detail.buoyName} entering high-pollution zone near ${detail.zone}`,
      });
      window.dispatchEvent(notifEvent);

      // Auto-dismiss after 6 seconds
      setTimeout(() => setAlert(null), 6000);
    };

    window.addEventListener("neptune-buoy-alert", handler);
    return () => window.removeEventListener("neptune-buoy-alert", handler);
  }, []);

  if (!alert) return null;

  return (
    <div className={styles.alertToast}>
      <span className={styles.alertIcon}>⚠️</span>
      <div>
        <div className={styles.alertText}>
          {alert.buoyName} entering high-pollution zone
        </div>
        <div className={styles.alertSub}>
          Near {alert.zone} • Health: {alert.healthScore}/100
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

interface BuoyPanelProps {
  buoy: BuoyState;
  onClose?: () => void;
}

export default function BuoyPanel({ buoy, onClose }: BuoyPanelProps) {
  const { sensors, sensorHistory } = buoy;
  const syncAgo = Math.max(0, Math.round((Date.now() - buoy.lastSync) / 1000));

  // Extract history arrays for sparklines
  const phHistory = sensorHistory.map((s) => s.pH);
  const turbHistory = sensorHistory.map((s) => s.turbidity);
  const doHistory = sensorHistory.map((s) => s.dissolvedO2);
  const condHistory = sensorHistory.map((s) => s.conductivity);
  const tempHistory = sensorHistory.map((s) => s.temperature);

  const color = healthColor(sensors.healthScore);

  return (
    <>
      <BuoyAlertToast />

      <div className={styles.buoyPanel}>
        <div className={styles.buoyHeader}>
          <div className={styles.buoyTitle}>
            <span className={styles.liveDot} />
            <span className={styles.buoyName}>🚢 {buoy.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className={styles.liveBadge}>LIVE</span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "none",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  lineHeight: 1,
                }}
                title="Stop monitoring"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className={styles.buoyMeta}>
          <div className={styles.metaLine}>
            <span>📍</span>
            <span>Currently: <strong>{buoy.currentZoneLabel}</strong></span>
          </div>
          <div className={styles.metaLine}>
            <span>🔄</span>
            <span>Last sync: <strong>{syncAgo < 2 ? "just now" : `${syncAgo}s ago`}</strong></span>
          </div>
        </div>

        {/* Sensor Readings */}
        <div className={styles.sensorGrid}>
          {/* pH */}
          <div className={styles.sensorRow}>
            <span className={styles.sensorLabel}>pH</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkline values={phHistory} color={sensors.pH < 7.5 || sensors.pH > 8.3 ? "#DC2626" : "#10B981"} max={9} />
              <span className={styles.sensorValue} style={{ color: sensors.pH < 7.5 ? "#DC2626" : sensors.pH < 7.8 ? "#F59E0B" : "#10B981" }}>
                {sensors.pH}
                <span className={styles.sensorStatus}>{statusIcon(sensors.pH, 7.8, 8.4, 7.2, 8.6)}</span>
              </span>
            </div>
          </div>

          {/* Turbidity */}
          <div className={styles.sensorRow}>
            <span className={styles.sensorLabel}>Turbidity</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkline values={turbHistory} color={sensors.turbidity > 40 ? "#DC2626" : sensors.turbidity > 15 ? "#F59E0B" : "#10B981"} max={80} />
              <span className={styles.sensorValue} style={{ color: sensors.turbidity > 40 ? "#DC2626" : sensors.turbidity > 15 ? "#F59E0B" : "#10B981" }}>
                {sensors.turbidity} <span style={{ fontWeight: 400, fontSize: "0.7rem" }}>NTU</span>
                <span className={styles.sensorStatus}>{statusIcon(sensors.turbidity, 0, 15, 15, 45)}</span>
              </span>
            </div>
          </div>

          {/* Dissolved O₂ */}
          <div className={styles.sensorRow}>
            <span className={styles.sensorLabel}>Dissolved O₂</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkline values={doHistory} color={sensors.dissolvedO2 < 5 ? "#DC2626" : sensors.dissolvedO2 < 6.5 ? "#F59E0B" : "#10B981"} max={10} />
              <span className={styles.sensorValue} style={{ color: sensors.dissolvedO2 < 5 ? "#DC2626" : sensors.dissolvedO2 < 6.5 ? "#F59E0B" : "#10B981" }}>
                {sensors.dissolvedO2} <span style={{ fontWeight: 400, fontSize: "0.7rem" }}>mg/L</span>
                <span className={styles.sensorStatus}>{statusIcon(sensors.dissolvedO2, 6.5, 10, 5, 6.5)}</span>
              </span>
            </div>
          </div>

          {/* Conductivity */}
          <div className={styles.sensorRow}>
            <span className={styles.sensorLabel}>Conductivity</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkline values={condHistory} color={sensors.conductivity > 45000 ? "#DC2626" : "#64748b"} max={60000} />
              <span className={styles.sensorValue} style={{ color: sensors.conductivity > 45000 ? "#DC2626" : "var(--text-primary)" }}>
                {sensors.conductivity.toLocaleString()} <span style={{ fontWeight: 400, fontSize: "0.65rem" }}>µS/cm</span>
              </span>
            </div>
          </div>

          {/* Temperature */}
          <div className={styles.sensorRow}>
            <span className={styles.sensorLabel}>Temperature</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkline values={tempHistory} color={sensors.temperature > 30 ? "#DC2626" : "#64748b"} max={34} />
              <span className={styles.sensorValue} style={{ color: sensors.temperature > 30 ? "#F59E0B" : "var(--text-primary)" }}>
                {sensors.temperature}°C
              </span>
            </div>
          </div>
        </div>

        {/* Health Score Footer */}
        <div className={styles.healthFooter}>
          <span className={styles.healthLabel}>Water Health Score</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className={styles.healthScore} style={{ color }}>
              {sensors.healthScore}/100
            </span>
            <span
              className={styles.healthBadge}
              style={{
                background: `${color}15`,
                color,
                border: `1px solid ${color}40`,
              }}
            >
              {healthLabel(sensors.healthScore)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
