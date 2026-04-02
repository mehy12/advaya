"use client";

import { useMemo } from "react";
import { FiAward, FiShield, FiStar, FiTrendingUp, FiCheck, FiLock, FiGift, FiUsers, FiActivity, FiArrowRight, FiDatabase, FiBookOpen } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import guardianData from "@/data/guardian-profiles.json";
import Link from "next/link";

const TIER_COLORS: Record<string, string> = {
  "Gold Guardian": "var(--guardian-gold)",
  "Silver Guardian": "var(--guardian-silver)",
  "Bronze Guardian": "var(--guardian-bronze)",
};

const TYPE_ICONS: Record<string, string> = {
  report: "📋",
  trace_bonus: "🔍",
  clean_zone: "🌊",
  weekly_bonus: "📅",
  corroboration: "🤝",
  compliance: "✅",
  transparency: "📊",
  sponsorship: "💰",
  cleanup: "🧹",
  referral: "👥",
};

export default function DashboardPage() {
  const { user, role } = useAuth();

  // Find the sample profile if logged in, otherwise default to a preview
  const profile = useMemo(() => {
    if (!user) return null;
    return guardianData.profiles.find((p) => p.id === user.role) || guardianData.profiles[0];
  }, [user]);

  const redeemedItems = useMemo(() => {
    return profile?.redemptions.filter(r => r.status === "redeemed") || [];
  }, [profile]);

  // PUBLIC DASHBOARD SECTION (Leaderboard + Contributors)
  const renderPublicStats = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
      {/* Global Leaderboard */}
      <div className="glass-strong animate-slide-up" style={{ padding: "32px", borderRadius: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "8px", background: "rgba(245, 158, 11, 0.1)", color: "var(--amber)", borderRadius: "10px" }}>
            <FiTrendingUp />
          </div>
          Guardian Leaderboard
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", padding: "8px 12px", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            <span style={{ width: "30px" }}>#</span>
            <span style={{ flex: 1 }}>Guardian ID</span>
            <span style={{ width: "60px", textAlign: "right" }}>Credits</span>
          </div>
          {guardianData.leaderboard.map((entry) => (
            <div key={entry.rank} style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "14px 12px",
              background: profile?.guardianId === entry.guardianId ? "rgba(13, 148, 136, 0.05)" : "transparent",
              borderRadius: "12px",
              border: profile?.guardianId === entry.guardianId ? "1px solid rgba(13, 148, 136, 0.2)" : "1px solid transparent"
            }}>
              <span style={{ width: "24px", fontWeight: 900, fontSize: "0.9rem", color: entry.rank <= 3 ? "var(--guardian-gold)" : "var(--text-muted)" }}>
                {entry.rank}
              </span>
              <span className="zk-hash" style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", flex: 1 }}>{entry.guardianId}</span>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                {entry.credits.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Contributors / Redemption History */}
      <div className="glass-strong animate-slide-up" style={{ padding: "32px", borderRadius: "24px", animationDelay: "0.1s" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "8px", background: "rgba(13, 148, 136, 0.1)", color: "var(--teal)", borderRadius: "10px" }}>
            <FiUsers />
          </div>
          Active Contributors
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { name: "GRD-2B5C-F912", task: "Chemical spill verified", date: "2 mins ago", gain: "+25" },
            { name: "GRD-6D4E-A723", task: "Source trace confirmed", date: "15 mins ago", gain: "+50" },
            { name: "GRD-1F8A-C356", task: "Coral health audit", date: "1 hour ago", gain: "+15" },
            { name: "GRD-8B7F-D194", task: "Citizen corroboration", date: "3 hours ago", gain: "+40" },
          ].map((item, i) => (
            <div key={i} className="glass" style={{ padding: "16px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{item.task} • {item.date}</div>
              </div>
              <div style={{ color: "var(--emerald)", fontWeight: 800, fontSize: "0.9rem" }}>{item.gain}</div>
            </div>
          ))}
          {!user && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <Link href="/login" className="btn btn-secondary btn-sm" style={{ width: "100%", borderRadius: "12px", borderStyle: "dashed" }}>
                Sign In to View Redemption History <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ADMIN VIEW (Compliance Only)
  const renderAdminView = () => (
    <div className="animate-slide-up" style={{ marginBottom: "40px" }}>
      <div className="glass-strong" style={{ padding: "32px", borderRadius: "24px", background: "var(--slate-900)", color: "#fff" }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", color: "var(--teal-light)" }}>
          <FiShield /> Compliance Command Center
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
           <div style={{ padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
             <p style={{ fontSize: "0.7rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px" }}>Fleet Uptime</p>
             <h3 style={{ fontSize: "2rem", fontWeight: 900 }}>99.8%</h3>
             <p style={{ fontSize: "0.75rem", color: "var(--emerald-light)", marginTop: "4px" }}>✅ All 9 Nodes Online</p>
           </div>
           <div style={{ padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
             <p style={{ fontSize: "0.7rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px" }}>Weekly AI Accuracy</p>
             <h3 style={{ fontSize: "2rem", fontWeight: 900 }}>94.2%</h3>
             <p style={{ fontSize: "0.75rem", color: "var(--teal-light)", marginTop: "4px" }}>+1.4% from last month</p>
           </div>
           <div style={{ padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
             <p style={{ fontSize: "0.7rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px" }}>Open Investigations</p>
             <h3 style={{ fontSize: "2rem", fontWeight: 900 }}>3</h3>
             <p style={{ fontSize: "0.75rem", color: "var(--coral-light)", marginTop: "4px" }}>⚠️ 2 Critical Threats</p>
           </div>
           <div style={{ padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
             <p style={{ fontSize: "0.7rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px" }}>Reports Pending Verification</p>
             <h3 style={{ fontSize: "2rem", fontWeight: 900 }}>142</h3>
             <button className="btn btn-primary btn-sm" style={{ marginTop: "12px", width: "100%", background: "var(--teal-light)", color: "var(--slate-900)" }}>Process Data</button>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 80px" }}>
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "48px" }} className="animate-fade-in">
        <div className="badge badge-amber" style={{ marginBottom: "16px" }}>
          <FiAward /> Public Ledger & Credits
        </div>
        <h1 className="text-gradient" style={{ fontSize: "3rem" }}>Platform Ecosystem</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px", maxWidth: "600px", margin: "12px auto 0" }}>
          Real-time transparency of oceanic guardians, verified contributors, and government-backed rewards.
        </p>
      </header>

      {role === "compliance" && renderAdminView()}

      <div style={{ display: "grid", gridTemplateColumns: user ? "380px 1fr" : "1fr", gap: "32px", alignItems: "start" }}>
        
        {/* Private Dashboard (Visible if User Logged In) */}
        {user && profile && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-slide-left">
            <div className="glass-strong" style={{ padding: "32px", borderRadius: "24px" }}>
               <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
                 <div style={{ fontSize: "3.5rem", width: "70px", height: "70px", background: "var(--slate-50)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
                   {user.avatar}
                 </div>
                 <div>
                   <h3 style={{ fontSize: "1.4rem", marginBottom: "2px" }}>{user.name}</h3>
                   <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                     <span className={`badge badge-emerald`} style={{ fontSize: "0.6rem" }}>{user.role}</span>
                     <span className="zk-hash" style={{ fontSize: "0.6rem" }}>{profile.guardianId}</span>
                   </div>
                 </div>
               </div>

               <div style={{ background: "var(--slate-900)", color: "#fff", padding: "24px", borderRadius: "20px" }}>
                  <p style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Available Balance</p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                    <span style={{ fontSize: "2.8rem", fontWeight: 900, lineHeight: 1, color: "var(--guardian-gold)" }}>{profile.creditBalance}</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, opacity: 0.8, marginBottom: "6px" }}>Credits</span>
                  </div>
                  <div style={{ marginTop: "16px", padding: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FiCheck style={{ color: "var(--emerald-light)" }} /> 
                    Verified by AI-Mesh Protocol
                  </div>
               </div>

               <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                 <div className="glass" style={{ padding: "16px", borderRadius: "16px", textAlign: "center" }}>
                   <div style={{ fontSize: "1.4rem", fontWeight: 900 }}>{profile.totalReports}</div>
                   <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Reports</div>
                 </div>
                 <div className="glass" style={{ padding: "16px", borderRadius: "16px", textAlign: "center" }}>
                   <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--emerald)" }}>{profile.verifiedReports}</div>
                   <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Fixed</div>
                 </div>
               </div>
            </div>

            {/* Redemption History */}
            <div className="glass-strong" style={{ padding: "24px", borderRadius: "24px" }}>
               <h3 style={{ fontSize: "0.95rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                 <FiBookOpen style={{ color: "var(--teal)" }} /> Redemption History
               </h3>
               {redeemedItems.length > 0 ? (
                 <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                   {redeemedItems.map(item => (
                     <div key={item.id} className="glass" style={{ padding: "12px 16px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                       <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{item.title}</div>
                         <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Redeemed {new Date(profile.memberSince).toLocaleDateString()}</div>
                       </div>
                       <FiCheck style={{ color: "var(--emerald)" }} />
                     </div>
                   ))}
                 </div>
               ) : (
                 <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>No redemptions yet.</p>
               )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {renderPublicStats()}

          {/* User Specific Actions (Marketplace) */}
          {user && profile && (
            <div className="glass-strong animate-slide-up" style={{ padding: "32px", borderRadius: "24px", animationDelay: "0.2s" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "8px", background: "rgba(245, 158, 11, 0.1)", color: "var(--amber)", borderRadius: "10px" }}>
                  <FiGift />
                </div>
                Redemption Marketplace
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                {profile.redemptions.filter(r => r.status !== "redeemed").map((r) => (
                  <div key={r.id} className="glass" style={{ padding: "24px", borderRadius: "20px", position: "relative", opacity: r.status === "locked" ? 0.6 : 1, transition: "all 0.3s" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "16px" }}>{r.icon}</div>
                    <h4 style={{ fontSize: "1rem", marginBottom: "8px" }}>{r.title}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.5 }}>{r.category}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, color: "var(--guardian-gold)", fontSize: "0.9rem" }}>{r.cost} credits</span>
                      {r.status === "locked" ? (
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><FiLock /> Locked</span>
                      ) : (
                        <button className="btn btn-primary btn-sm" style={{ borderRadius: "8px" }}>Redeem</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

