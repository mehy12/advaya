"use client";

import { useCallback, useState } from "react";
import { FiUploadCloud, FiImage } from "react-icons/fi";
import styles from "./Detect.module.css";

interface Props {
  onUpload: (file: File) => void;
}

export default function ImageUploader({ onUpload }: Props) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Validate image
      if (e.dataTransfer.files[0].type.startsWith("image/")) {
        onUpload(e.dataTransfer.files[0]);
      }
    }
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`${styles.uploadArea} glass-strong ${dragActive ? styles.dragActive : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        onChange={handleChange} 
        id="image-upload" 
        style={{ display: "none" }} 
      />
      <label htmlFor="image-upload" className={styles.uploadLabel}>
         <div className={styles.uploadIcon}>
           <FiUploadCloud />
         </div>
         <h3>Drag & Drop or Take Photo</h3>
         <p>Supports JPEG, PNG, WEBP (Max 5MB)</p>
         <div className="btn btn-primary" style={{ marginTop: "20px" }}>
            <FiImage /> Select Image
         </div>
      </label>
    </div>
  );
}
