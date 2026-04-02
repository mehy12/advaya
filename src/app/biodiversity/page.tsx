"use client";

import { useState, useEffect } from "react";
import speciesData from "@/data/species-graph.json";
import styles from "@/components/biodiversity/Biodiversity.module.css";
import { FiAlertTriangle, FiActivity, FiTrendingDown, FiClock, FiDollarSign, FiZap, FiMapPin } from "react-icons/fi";
import type { PredictionResult, SpeciesForecast } from "@/lib/prediction-model";

const POLLUTION_TYPES = [
  { value: "oil", label: "Oil Spill" },
  { value: "chemical", label: "Chemical Discharge" },
  { value: "sewage", label: "Urban Sewage" },
  { value: "plastic", label: "Microplastic Surge" },
  { value: "agricultural", label: "Paddy Field Runoff" },
  { value: "shipping", label: "Port Violation" },
  { value: "ghost_gear", label: "Ghost Gear / Nets" },
];

const STATUS_COLORS: Record<string, string> = {
  stable: "var(--emerald)",
  declining: "var(--amber)",
  critical: "var(--coral)",
  collapsed: "var(--red)",
};

export default function BiodiversityPage() {
  const [pollutionType, setPollutionType] = useState("oil");
  const [severity, setSeverity] = useState(3);
  const [surfaceArea, setSurfaceArea] = useState(2);
  const [durationDays, setDurationDays] = useState(1);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ severity, pollutionType, surfaceAreaKm2: surfaceArea, durationDays }),
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    runPrediction();
  }, []);

  // Auto-run prediction on parameter change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      runPrediction();
    }, 500);
    return () => clearTimeout(timer);
  }, [severity, pollutionType, surfaceArea, durationDays]);

  return (
    <div className={styles.container} style={{ maxWidth: "1400px" }}>
      <header className={styles.header}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
          <div className="badge badge-purple">
            <FiZap /> AI Forecasting Engine
          </div>
          <div className="badge badge-teal">
            <FiMapPin /> Kerala Coastal Regions (Vembanad & Malabar)
          </div>
        </div>
        <h1 className="text-gradient" style={{ fontSize: "3.5rem", marginBottom: "8px" }}>Biodiversity Analytics</h1>
        <p className={styles.subtitle} style={{ fontSize: "1.2rem", opacity: 0.8 }}>
          Predicting 30/60/90 day ecosystem cascades for Kerala's mangroves and backwater species.
        </p>
      </header>

      <div className={styles.content} style={{ gridTemplateColumns: "350px 1fr" }}>
        {/* Left Column - Controls */}
        <div className={styles.sidebar}>
          
          <div className={`${styles.card} glass-strong animate-slide-up`}>
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FiActivity style={{ color: "var(--teal)" }} /> Impact Parameters
            </h3>

            <p className={styles.label}>Pollution Category</p>
            <select
              value={pollutionType}
              onChange={(e) => setPollutionType(e.target.value)}
              style={{ width: "100%", padding: "12px", background: "#ffffff", border: "1px solid var(--border-subtle)", borderRadius: "12px", color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "20px", fontWeight: 600 }}
            >
              {POLLUTION_TYPES.map(pt => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>

            <p className={styles.label}>Severity (Impact Index)</p>
            <input type="range" className={styles.slider} min="1" max="5"
              value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
            <div className={styles.sliderReadout} style={{ marginBottom: "20px" }}>
              <span>Minimal</span>
              <span style={{ fontWeight: 900, color: "var(--teal)", fontSize: "1.2rem" }}>L-{severity}</span>
              <span>Extreme</span>
            </div>

            <p className={styles.label}>Estuarine Spread (km²)</p>
            <input type="range" className={styles.slider} min="0.5" max="20" step="0.5"
              value={surfaceArea} onChange={(e) => setSurfaceArea(Number(e.target.value))} />
            <div className={styles.sliderReadout} style={{ marginBottom: "20px" }}>
              <span>0.5 km²</span>
              <span style={{ fontWeight: 800 }}>{surfaceArea} km²</span>
              <span>20 km²</span>
            </div>

            <p className={styles.label}>Active Exposure (Days)</p>
            <input type="range" className={styles.slider} min="1" max="90"
              value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} />
            <div className={styles.sliderReadout} style={{ marginBottom: "24px" }}>
              <span>1 day</span>
              <span style={{ fontWeight: 800 }}>{durationDays} days</span>
              <span>90 days</span>
            </div>

            <button className="btn btn-primary" onClick={runPrediction}
              disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: "14px", fontWeight: 700 }}>
              {loading ? "Simulating..." : "Recalculate Kerala Forecast"}
            </button>
          </div>

          {/* Cascade Timeline */}
          {prediction && (
            <div className={`${styles.card} glass-strong animate-slide-up`} style={{ animationDelay: "0.2s" }}>
              <h3 style={{ marginBottom: "16px" }}>Ecosystem Multipliers</h3>
              <ul className={styles.warningList} style={{ listStyle: "none", padding: 0 }}>
                {speciesData.cascadeRules.map((rule, idx) => (
                  <li key={idx} style={{ marginBottom: "12px", background: "rgba(0,0,0,0.03)", padding: "12px", borderRadius: "10px", borderLeft: "4px solid var(--coral)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span className="badge badge-coral" style={{ fontSize: "0.6rem" }}>T+{rule.delay}d Trigger</span>
                    </div>
                    <p style={{ fontSize: "0.75rem", margin: 0, lineHeight: 1.4, fontWeight: 600 }}>{rule.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {prediction ? (
            <>
              {/* Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {[
                  { label: "Community Loss (30d)", value: `₹${prediction.totalEconomicLoss30Crore} Cr`, color: "var(--amber)", desc: "Fishery Impact" },
                  { label: "Stability Drop (60d)", value: `₹${prediction.totalEconomicLoss60Crore} Cr`, color: "var(--coral)", desc: "Habitat Degradation" },
                  { label: "System Risk (90d)", value: `₹${prediction.totalEconomicLoss90Crore} Cr`, color: "var(--red)", desc: "Ecosystem Collapse" },
                ].map((s) => (
                  <div key={s.label} className="glass-strong" style={{ padding: "32px 24px", textAlign: "center", borderRadius: "24px" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", fontWeight: 700 }}>{s.label}</div>
                    <div style={{ fontSize: "2.4rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: s.color, marginBottom: "8px" }}>{s.value}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>{s.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
                {/* Species Table */}
                <div className="glass-strong" style={{ padding: "32px", borderRadius: "24px" }}>
                  <h3 style={{ fontSize: "1.4rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", fontWeight: 900 }}>
                    <FiTrendingDown style={{ color: "var(--coral)" }} /> Kerala Species Forecast (Malabar/Vembanad)
                  </h3>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--border-strong)", textAlign: "left" }}>
                          <th style={{ padding: "12px 8px", color: "var(--text-muted)", fontWeight: 700 }}>Indicator Species</th>
                          <th style={{ padding: "12px 8px", textAlign: "center", color: "var(--text-muted)" }}>Current</th>
                          <th style={{ padding: "12px 8px", textAlign: "center", color: "var(--text-muted)" }}>30d Exp</th>
                          <th style={{ padding: "12px 8px", textAlign: "center", color: "var(--text-muted)" }}>60d Exp</th>
                          <th style={{ padding: "12px 8px", textAlign: "center", color: "var(--text-muted)" }}>90d Exp</th>
                          <th style={{ padding: "12px 8px", textAlign: "right", color: "var(--text-muted)" }}>Econ-Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prediction.forecasts.map((f: SpeciesForecast) => (
                          <tr key={f.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td style={{ padding: "14px 8px", fontWeight: 700 }}>
                              <span style={{ marginRight: "10px", fontSize: "1.2rem" }}>{f.icon}</span>{f.name}
                            </td>
                            <td style={{ padding: "14px 8px", textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                              {f.baselinePopulation}%
                            </td>
                            <td style={{ padding: "14px 8px", textAlign: "center", fontFamily: "var(--font-mono)", color: STATUS_COLORS[f.status30], fontWeight: 700 }}>
                              {f.day30}%
                            </td>
                            <td style={{ padding: "14px 8px", textAlign: "center", fontFamily: "var(--font-mono)", color: STATUS_COLORS[f.status60], fontWeight: 700 }}>
                              {f.day60}%
                            </td>
                            <td style={{ padding: "14px 8px", textAlign: "center", fontFamily: "var(--font-mono)", color: STATUS_COLORS[f.status90], fontWeight: 900 }}>
                              {f.day90}%
                            </td>
                            <td style={{ padding: "14px 8px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--red)", fontWeight: 800 }}>
                              ₹{f.economicLoss90 > 100000 ? `${(f.economicLoss90 / 100000).toFixed(1)}L` : f.economicLoss90.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Critical Warning */}
                  <div className="glass-strong" style={{ padding: "24px", borderRadius: "24px", border: "1px solid var(--coral)", background: "rgba(220,38,38,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--red)", marginBottom: "16px" }}>
                      <FiAlertTriangle size={24} /> <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>Primary Vulnerability</h4>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--red)", marginBottom: "8px" }}>{prediction.mostVulnerable}</div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      Under current severity levels, {prediction.mostVulnerable} shows the highest rate of exponential decay, triggering a potential local extinction within Kerala estuaries by T+90.
                    </p>
                  </div>

                  {/* Benefit of Action */}
                  <div className="glass-strong" style={{ padding: "24px", borderRadius: "24px" }}>
                    <h4 style={{ fontSize: "1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 800 }}>
                      <FiClock style={{ color: "var(--teal)" }} /> Early Intervention Benefit
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <div style={{ fontSize: "0.7rem", color: "var(--emerald)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>Immediate Response</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{prediction.interventionBenefit.ifNow}</div>
                      </div>
                      <div style={{ opacity: 0.7 }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--red)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>Delayed (60 Days)</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{prediction.interventionBenefit.if60Days}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualization Placeholder / Meta */}
              <div className="glass" style={{ padding: "20px 32px", fontSize: "0.8rem", color: "var(--text-secondary)", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Prediction Model:</strong> Exponential Decay (Kerala-Coast Calibrated) • 
                  <strong> Calibration:</strong> CMFRI Kerala Catch Data, GBIF Malabar occurrences
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span className="badge badge-teal">Vembanad Lake</span>
                  <span className="badge badge-purple">Malabar Coast</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }} className="glass-strong">
               <div style={{ textAlign: "center" }}>
                  <div className="skeleton-circle" style={{ width: "80px", height: "80px", margin: "0 auto 20px" }}></div>
                  <h3 style={{ opacity: 0.3 }}>Initializing Kerala Forecast Engine...</h3>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
