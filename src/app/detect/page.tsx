"use client";

import { useState } from "react";
import ImageUploader from "@/components/detect/ImageUploader";
import AnalysisResult from "@/components/detect/AnalysisResult";
import styles from "@/components/detect/Detect.module.css";
import { FiCamera } from "react-icons/fi";

export default function DetectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const readFileAsDataURL = (input: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(input);
    });
  };

  const handleUpload = async (file: File) => {
    setFile(file);
    setAnalyzing(true);
    setResult(null);

    try {
      const resultBase64 = await readFileAsDataURL(file);
      setBase64(resultBase64);

      // Strip data:image/...;base64,
      const base64Data = resultBase64.split(",")[1];
      const mimeType = file.type;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data, mimeType }),
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null);
        const message =
          errorPayload?.error ||
          errorPayload?.details ||
          `Analysis failed (${res.status})`;
        throw new Error(message);
      }

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to analyze image.";
      alert(message);
    } finally {
      // Keeping analyzing state true briefly for animation effect
      setTimeout(() => setAnalyzing(false), 500);
    }
  };

  const clear = () => {
    setFile(null);
    setBase64(null);
    setResult(null);
    setSelectedLocation(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.iconWrapper} style={{ background: "rgba(255, 193, 7, 0.15)", color: "var(--amber)", margin: "0 auto 16px auto", width: "64px", height: "64px", fontSize: "2rem" }}>
          <FiCamera />
        </div>
        <h1 className="text-gradient">AI Pollution Detector</h1>
        <p className={styles.subtitle}>Upload an ocean photo. Gemini Vision will analyze the pollution type, severity, and recommend action.</p>
      </header>

      <div className={styles.content}>
        {!file && (
          <ImageUploader onUpload={handleUpload} />
        )}

        {file && analyzing && (
           <div className={`${styles.analyzingCard} glass animate-pulse`}>
              <div className={styles.imagePreview}>
                {base64 && <img src={base64} alt="Preview" />}
                 <div className={styles.scanningLine}></div>
              </div>
              <h3 style={{ marginTop: "20px", color: "var(--teal)" }}>Gemini Vision analyzing...</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Scanning for anomalies, effluent signatures, and hazardous materials.</p>
           </div>
        )}

          {file && result && !analyzing && base64 && (
          <div className="animate-slide-up">
            <AnalysisResult
              result={result}
              imageBase64={base64}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              onClear={clear}
            />
          </div>
        )}
      </div>
    </div>
  );
}
