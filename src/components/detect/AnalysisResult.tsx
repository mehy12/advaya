"use client";

import { FiAlertCircle, FiCheckCircle, FiInfo, FiMapPin, FiRefreshCw } from "react-icons/fi";
import styles from "./Detect.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  result: {
    pollution_type: string;
    severity: number;
    description: string;
    recommended_action: string;
    affected_area: string;
    confidence: number;
    is_pollution: boolean;
  };
  imageBase64: string;
  onClear: () => void;
}

export default function AnalysisResult({ result, imageBase64, onClear }: Props) {
  const router = useRouter();

  if (!result.is_pollution) {
    return (
      <div className={`${styles.resultCard} glass-strong`}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", color: "var(--emerald)" }}>
          <FiCheckCircle size={32} />
          <h2 style={{ margin: 0 }}>No Pollution Detected</h2>
        </div>
        <div className={styles.imagePreviewSmall}>
           <img src={imageBase64} alt="Analyzed" />
        </div>
        <p style={{ color: "var(--text-secondary)", marginTop: "20px" }}>{result.description}</p>
        <button className="btn btn-secondary" onClick={onClear} style={{ marginTop: "24px", width: "100%" }}>
          Scan Another Image
        </button>
      </div>
    );
  }

  const getBadgeClass = (severity: number) => {
    if (severity >= 4) return "badge-coral";
    if (severity === 3) return "badge-amber";
    return "badge-teal";
  };

  const getIcon = (severity: number) => {
    if (severity >= 4) return <FiAlertCircle style={{ color: "var(--coral)" }} />;
    return <FiInfo style={{ color: "var(--amber)" }} />;
  };

  return (
    <div className={styles.resultGrid}>
      <div className={`${styles.imagePreview} glass-strong`}>
         <img src={imageBase64} alt="Analyzed" />
         <div className={styles.confidenceOverlay}>
           AI Confidence: {(result.confidence * 100).toFixed(1)}%
         </div>
      </div>

      <div className={`${styles.resultDetails} glass`}>
         <div className={styles.resultHeader}>
           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
             {getIcon(result.severity)}
             <span className={`badge ${getBadgeClass(result.severity)}`}>
               Severity {result.severity}/5
             </span>
           </div>
           <h2 style={{ marginTop: "12px", textTransform: "capitalize" }}>{result.pollution_type.replace('_', ' ')} Detected</h2>
         </div>

         <div className={styles.detailSection}>
           <h4>Description</h4>
           <p>{result.description}</p>
         </div>

         <div className={styles.detailSection}>
           <h4>Estimated Area</h4>
           <div className="mono" style={{ background: "var(--bg-card)", padding: "8px 12px", borderRadius: "var(--radius-sm)", display: "inline-block" }}>
             {result.affected_area}
           </div>
         </div>

         <div className={styles.detailSection}>
           <h4>Recommended Action</h4>
           <p style={{ color: "var(--ocean-100)" }}>{result.recommended_action}</p>
         </div>

         <div className={styles.actions}>
           <button 
             className="btn btn-primary" 
             style={{ flex: 1 }}
             onClick={() => router.push('/map')}
           >
             <FiMapPin /> Add to Map
           </button>
           <button className="btn btn-secondary" onClick={onClear}>
             <FiRefreshCw /> Scan Next
           </button>
         </div>
      </div>
    </div>
  );
}
