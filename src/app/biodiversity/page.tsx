"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import speciesData from "@/data/species-graph.json";
import styles from "@/components/biodiversity/Biodiversity.module.css";
import { FiAlertTriangle } from "react-icons/fi";

const SpeciesGraph = dynamic(() => import("@/components/biodiversity/SpeciesGraph"), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ width: "100%", height: "400px" }}></div>
});

export default function BiodiversityPage() {
  const [coralCover, setCoralCover] = useState(100);

  const getImpact = (cover: number) => {
    // Basic interpolation for economic impact
    const scenario = speciesData.economicImpact.scenarios.reduce((prev, curr) => 
      Math.abs(curr.coralCover - cover) < Math.abs(prev.coralCover - cover) ? curr : prev
    );
    return scenario;
  };

  const currentImpact = getImpact(coralCover);
  
  // Calculate collapsed species based on thresholds
  const getCollapsed = () => {
    const collapsed = new Set<string>();
    
    // Check direct coral threshold
    const coralNode = speciesData.nodes.find(n => n.id === "coral");
    if (coralNode && coralCover <= coralNode.threshold) collapsed.add("coral");

    // Check cascade rules
    speciesData.cascadeRules.forEach(rule => {
      // If trigger is coral, compare against coralCover
      if (rule.trigger === "coral" && coralCover <= rule.threshold) {
         rule.affects.forEach(id => collapsed.add(id));
      }
      // If trigger is another species, check if it's already collapsed
      else if (collapsed.has(rule.trigger)) {
         // Recursive check in a real system (simplified here)
         rule.affects.forEach(id => collapsed.add(id));
      }
    });

    return Array.from(collapsed);
  };

  const collapsedIds = getCollapsed();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className="text-gradient">Biodiversity Cascade Predictor</h1>
        <p className={styles.subtitle}>Gulf of Mannar Species Dependency Map</p>
      </header>

      <div className={styles.content}>
        {/* Left Column - Controls & Impact */}
        <div className={styles.sidebar}>
          
          <div className={`${styles.card} glass`}>
            <h3>Interactive Stressor</h3>
            <p className={styles.label}>Adjust Coral Reef Cover (%)</p>
            <input 
              type="range" 
              className={styles.slider} 
              min="0" max="100" 
              value={coralCover} 
              onChange={(e) => setCoralCover(Number(e.target.value))}
            />
            <div className={styles.sliderReadout}>
              <span>0% (Dead)</span>
              <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: coralCover < 60 ? "var(--coral)" : "var(--teal)" }}>{coralCover}%</span>
              <span>100% (Healthy)</span>
            </div>
            
            <div style={{ marginTop: "16px", padding: "12px", background: "rgba(255,107,107,0.1)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--coral-light)", marginBottom: "8px" }}>
                <FiAlertTriangle /> <strong>Economic Impact</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Daily Loss:</span>
                <span className={styles.counter} style={{ color: coralCover < 60 ? "var(--coral)" : "var(--emerald)" }}>
                  ₹ {currentImpact.totalDailyLoss.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Fisheries Affected:</span>
                <span style={{ fontWeight: "bold" }}>400 families</span>
              </div>
            </div>
          </div>

          <div className={`${styles.card} glass-strong animate-slide-up`} style={{ animationDelay: "0.2s" }}>
            <h3>Cascade Timeline Warning</h3>
            {collapsedIds.length === 0 ? (
               <p style={{ color: "var(--emerald)" }}>Ecosystem is currently stable at this coral cover level.</p>
            ) : (
               <ul className={styles.warningList}>
                 {speciesData.cascadeRules.filter(r => 
                    (r.trigger === "coral" && coralCover <= r.threshold) || 
                    collapsedIds.includes(r.trigger)
                 ).map((rule, idx) => (
                   <li key={idx}>
                     <span className={styles.delayBadge}>T+{rule.delay} days</span>
                     <p>{rule.description}</p>
                   </li>
                 ))}
               </ul>
            )}
          </div>
        </div>

        {/* Right Column - D3 Graph */}
        <div className={`${styles.graphWrapper} glass-strong`}>
          <SpeciesGraph coralCover={coralCover} collapsedIds={collapsedIds} />
        </div>
      </div>
    </div>
  );
}
