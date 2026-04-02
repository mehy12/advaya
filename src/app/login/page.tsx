"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import { FiShield, FiAnchor, FiUser, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleLogin = () => {
    if (selectedRole) {
      login(selectedRole);
      router.push("/dashboard");
    }
  };

  const roles = [
    {
      id: "fisherman",
      title: "Local Fisherman",
      desc: "Protect your waters and earn Guardian Credits for verified reports.",
      icon: <FiAnchor />,
      color: "var(--blue)",
      benefits: ["License discounts", "Fuel subsidies", "Exclusive fishing zones"]
    },
    {
      id: "compliance",
      title: "Compliance Officer",
      desc: "Access high-level telemetry and coordinate environmental response.",
      icon: <FiShield />,
      color: "var(--teal)",
      benefits: ["Threat analytics", "Vessel tracking", "AI trace reports"]
    },
    {
      id: "citizen",
      title: "Active Citizen",
      desc: "Contribute to the public ledger and build your environmental rank.",
      icon: <FiUser />,
      color: "var(--purple)",
      benefits: ["Leaderboard rank", "Community awards", "Public recognition"]
    },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - var(--nav-height))", background: "var(--slate-50)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }} className="animate-slide-up">
          <div className="badge badge-teal" style={{ marginBottom: "16px" }}>SECURE ACCESS</div>
          <h1 className="text-gradient" style={{ marginBottom: "12px" }}>Choose Your Perspective</h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto" }}>
            Select your role to access role-specific incentives and the OceanSentinel command center.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {roles.map((role, idx) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id as UserRole)}
              className={`glass-strong animate-slide-up stagger-item`}
              style={{
                padding: "32px",
                cursor: "pointer",
                borderRadius: "24px",
                border: selectedRole === role.id ? `2px solid ${role.color}` : "2px solid transparent",
                transform: selectedRole === role.id ? "translateY(-8px)" : "none",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                animationDelay: `${idx * 0.1}s`,
                background: selectedRole === role.id ? "#fff" : "rgba(255, 255, 255, 0.6)",
                boxShadow: selectedRole === role.id ? `0 20px 40px -12px ${role.color}40` : "var(--shadow-sm)"
              }}
            >
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "14px", 
                background: selectedRole === role.id ? role.color : "var(--slate-100)", 
                color: selectedRole === role.id ? "#fff" : role.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "20px",
                transition: "all 0.3s"
              }}>
                {role.icon}
              </div>
              <h3 style={{ marginBottom: "8px", color: selectedRole === role.id ? role.color : "var(--text-primary)" }}>{role.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.5 }}>{role.desc}</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {role.benefits.map(benefit => (
                  <div key={benefit} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
                    <FiCheckCircle style={{ color: selectedRole === role.id ? role.color : "var(--slate-400)" }} />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }} className="animate-fade-in">
          <button
            onClick={handleLogin}
            disabled={!selectedRole}
            className="btn btn-primary btn-lg"
            style={{ 
              padding: "16px 48px", 
              fontSize: "1.05rem", 
              borderRadius: "16px",
              opacity: selectedRole ? 1 : 0.5,
              cursor: selectedRole ? "pointer" : "not-allowed",
              boxShadow: selectedRole ? "0 10px 20px -5px rgba(0,0,0,0.2)" : "none"
            }}
          >
            Enter OceanSentinel <FiArrowRight />
          </button>
          <div style={{ marginTop: "24px" }}>
            <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
              ← Return to homepage
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .badge-teal {
          background: rgba(13, 148, 136, 0.1);
          color: var(--teal);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
