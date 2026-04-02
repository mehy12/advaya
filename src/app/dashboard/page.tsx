"use client";

import { useMemo, useState } from "react";
import { FiAward, FiShield, FiStar, FiTrendingUp, FiCheck, FiLock, FiGift, FiUsers, FiActivity, FiArrowRight, FiDatabase, FiBookOpen, FiArrowUpRight, FiSearch } from "react-icons/fi";
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
  const [activeTab, setActiveTab] = useState<"earnings" | "reports" | "redemptions">("earnings");

  // Find the sample profile if logged in, otherwise default to a preview
  const profile = useMemo(() => {
    if (!user) return null;
    return guardianData.profiles.find((p) => p.id === user.role) || guardianData.profiles[0];
  }, [user]);

  const redeemedItems = useMemo(() => {
    return profile?.redemptions.filter(r => r.status === "redeemed") || [];
  }, [profile]);

  // SIDEBAR (Global Stats)
  const renderSidebar = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-slide-left">
      {/* Global Leaderboard */}
      <div className="glass-strong" style={{ padding: "24px", borderRadius: "20px" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 700 }}>
          <FiTrendingUp style={{ color: "var(--amber)" }} />
          Leaderboard
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", padding: "8px 10px", fontSize: "0.6rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            <span style={{ width: "24px" }}>#</span>
            <span style={{ flex: 1 }}>Guardian</span>
            <span style={{ width: "50px", textAlign: "right" }}>CR</span>
          </div>
          {guardianData.leaderboard.slice(0, 8).map((entry) => (
            <div key={entry.rank} style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 8px",
              background: profile?.guardianId === entry.guardianId ? "rgba(13, 148, 136, 0.08)" : "transparent",
              borderRadius: "10px",
              border: profile?.guardianId === entry.guardianId ? "1px solid rgba(13, 148, 136, 0.2)" : "1px solid transparent"
            }}>
              <span style={{ width: "20px", fontWeight: 900, fontSize: "0.8rem", color: entry.rank <= 3 ? "var(--guardian-gold)" : "var(--text-muted)" }}>
                {entry.rank}
              </span>
              <span className="zk-hash" style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", flex: 1 }}>{entry.guardianId}</span>
              <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                {entry.credits}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Contributors */}
      <div className="glass-strong" style={{ padding: "24px", borderRadius: "20px" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 700 }}>
          <FiActivity style={{ color: "var(--teal)" }} />
          Live Network
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { name: "GRD-2B5C", task: "Chemical spill", gain: "+25" },
            { name: "GRD-6D4E", task: "Source trace", gain: "+50" },
            { name: "GRD-1F8A", task: "Coral audit", gain: "+15" },
          ].map((item, i) => (
            <div key={i} className="glass" style={{ padding: "12px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{item.task}</div>
              </div>
              <div style={{ color: "var(--emerald)", fontWeight: 800, fontSize: "0.75rem" }}>{item.gain}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ADMIN VIEW
  const renderAdminView = () => (
    <div className="animate-slide-up" style={{ marginBottom: "32px" }}>
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
             <p style={{ fontSize: "0.7rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px" }}>Pending Data</p>
             <h3 style={{ fontSize: "2rem", fontWeight: 900 }}>142</h3>
             <button className="btn btn-primary btn-sm" style={{ marginTop: "12px", width: "100%", background: "var(--teal-light)", color: "var(--slate-900)" }}>Process Data</button>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Header */}
      <header style={{ marginBottom: "48px" }} className="animate-fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="badge badge-amber" style={{ marginBottom: "16px" }}>
              <FiAward /> Platform Ecosystem
            </div>
            <h1 className="text-gradient" style={{ fontSize: "3rem", margin: 0 }}>Marine Intelligence Ledger</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "8px", maxWidth: "600px" }}>
              Real-time transparency of oceanic guardians, verified contributors, and government-backed rewards.
            </p>
          </div>
          {!user && (
            <Link href="/login" className="btn btn-primary" style={{ padding: "12px 32px", borderRadius: "14px" }}>
              Guardian Sign In <FiArrowRight />
            </Link>
          )}
        </div>
      </header>

      {role === "compliance" && renderAdminView()}

      <div style={{ display: "grid", gridTemplateColumns: user ? "1fr 380px" : "1fr", gap: "40px", alignItems: "start" }}>
        
        {/* Main Content (Personal Data First) */}
        {user && profile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }} className="animate-slide-up">
            
            {/* Expanded Personal Data Header */}
            <div className="glass-strong" style={{ padding: "40px", borderRadius: "32px", display: "grid", gridTemplateColumns: "auto 1fr 280px", gap: "40px", alignItems: "center" }}>
              <div style={{ fontSize: "5rem", width: "100px", height: "100px", background: "var(--slate-50)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
                {user.avatar}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span className={`badge badge-emerald`} style={{ fontSize: "0.7rem", padding: "4px 12px" }}>{user.role}</span>
                  <span className="zk-hash" style={{ fontSize: "0.7rem", opacity: 0.6 }}>{profile.guardianId}</span>
                </div>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0 }}>{user.name}</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  Active Guardian since {new Date(profile.memberSince).toLocaleDateString()}
                </p>
              </div>

              <div style={{ background: "var(--slate-900)", color: "#fff", padding: "32px", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                <p style={{ fontSize: "0.75rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px" }}>Available Balance</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                  <span style={{ fontSize: "3.5rem", fontWeight: 900, lineHeight: 1, color: "var(--guardian-gold)" }}>{profile.creditBalance}</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, opacity: 0.8, marginBottom: "8px" }}>CR</span>
                </div>
                <div style={{ marginTop: "20px", display: "flex", gap: "16px" }}>
                   <div style={{ flex: 1 }}>
                     <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{profile.totalReports}</div>
                     <div style={{ fontSize: "0.6rem", opacity: 0.5, textTransform: "uppercase" }}>Reports</div>
                   </div>
                   <div style={{ flex: 1 }}>
                     <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--emerald-light)" }}>{profile.verifiedReports}</div>
                     <div style={{ fontSize: "0.6rem", opacity: 0.5, textTransform: "uppercase" }}>Verified</div>
                   </div>
                </div>
              </div>
            </div>

            {/* BIG History Tabs Section */}
            <div className="glass-strong" style={{ padding: "40px", borderRadius: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: 900 }}>Guardian Activity Log</h2>
                <div style={{ display: "flex", gap: "12px", background: "rgba(0,0,0,0.05)", padding: "6px", borderRadius: "14px" }}>
                  {[
                    { id: "earnings", label: "Credits", icon: <FiTrendingUp /> },
                    { id: "reports", label: "Submissions", icon: <FiShield /> },
                    { id: "redemptions", label: "Claimed Gifts", icon: <FiGift /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 20px", borderRadius: "10px",
                        background: activeTab === tab.id ? "white" : "transparent",
                        color: activeTab === tab.id ? "var(--teal)" : "var(--text-secondary)",
                        boxShadow: activeTab === tab.id ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                        border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 700,
                        transition: "all 0.2s", whiteSpace: "nowrap"
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ minHeight: "400px" }}>
                {activeTab === "earnings" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {profile.earningHistory.map(item => (
                      <div key={item.id} className="glass" style={{ padding: "24px 32px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "24px", transition: "transform 0.2s" }}>
                        <div style={{ fontSize: "2.2rem", width: "60px", height: "60px", background: "rgba(0,0,0,0.03)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] || "💎"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>{item.action}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                              <FiActivity size={12} /> {new Date(item.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="badge badge-amber" style={{ fontSize: "0.6rem" }}>{item.type.replace('_', ' ').toUpperCase()}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "var(--emerald)", fontWeight: 900, fontSize: "1.8rem", lineHeight: 1 }}>+{item.credits}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Credits</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reports" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {profile.earningHistory.filter(e => e.type === "report" || e.type === "trace_bonus").map(item => (
                      <div key={item.id} className="glass" style={{ padding: "24px 32px", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <span className="badge badge-teal" style={{ padding: "6px 12px", fontSize: "0.7rem" }}>{item.type === "report" ? "POLLUTION INCIDENT" : "SOURCE TRACE"}</span>
                            <span className="badge badge-emerald" style={{ padding: "6px 12px", fontSize: "0.7rem" }}><FiCheck /> VERIFIED</span>
                          </div>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{new Date(item.date).toLocaleDateString("en-IN", { dateStyle: 'long' })}</span>
                        </div>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>{item.action}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "var(--emerald)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FiCheck size={14} />
                          </div>
                          Contribution verified by AI Node #7A3F • Reward: <strong style={{ color: "var(--emerald)" }}>{item.credits} CR</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "redemptions" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {redeemedItems.length > 0 ? (
                      redeemedItems.map(item => (
                        <div key={item.id} className="glass" style={{ padding: "24px 32px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "24px" }}>
                          <div style={{ fontSize: "2.2rem", width: "60px", height: "60px", background: "rgba(245, 158, 11, 0.05)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {item.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "4px" }}>{item.title}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                              <FiAward /> {item.category} • Beneficiary: {user.name}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                            <span className="badge badge-emerald" style={{ padding: "8px 16px" }}>REDEEMED</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.cost} credits spent</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
                        <FiGift style={{ fontSize: "4rem", marginBottom: "20px", opacity: 0.1 }} />
                        <h3 style={{ fontSize: "1.4rem", fontWeight: 700 }}>No claimed gifts yet</h3>
                        <p style={{ fontSize: "0.95rem" }}>Earn more credits to unlock government-backed rewards.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Redemption Marketplace */}
            <div className="glass-strong" style={{ padding: "40px", borderRadius: "32px", marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: 900 }}>Available Marketplace</h2>
                <Link href="/redeem" style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--teal)", display: "flex", alignItems: "center", gap: "6px" }}>
                  View Full Catalog <FiArrowUpRight />
                </Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                {profile.redemptions.filter(r => r.status !== "redeemed").map((r) => (
                  <div key={r.id} className="glass" style={{ padding: "32px", borderRadius: "24px", position: "relative", opacity: r.status === "locked" ? 0.6 : 1, transition: "all 0.3s" }}>
                    {r.status === "locked" && (
                      <div style={{ position: "absolute", top: "20px", right: "20px", color: "var(--text-muted)" }}><FiLock size={20} /></div>
                    )}
                    <div style={{ fontSize: "3rem", marginBottom: "20px" }}>{r.icon}</div>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "8px" }}>{r.title}</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "32px", lineHeight: 1.6 }}>{r.category}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
                      <div>
                        <span style={{ fontWeight: 900, color: "var(--guardian-gold)", fontSize: "1.2rem" }}>{r.cost}</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, marginLeft: "4px", opacity: 0.7 }}>CR</span>
                      </div>
                      <button 
                        disabled={r.status === "locked" || profile.creditBalance < r.cost}
                        className={`btn ${r.status === "locked" ? "btn-secondary" : "btn-primary"}`} 
                        style={{ borderRadius: "12px", padding: "10px 24px" }}
                      >
                        {r.status === "locked" ? "Insufficient Credits" : "Claim Gift"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div className="glass-strong" style={{ padding: "60px", borderRadius: "32px", textAlign: "center" }}>
              <div style={{ fontSize: "4rem", marginBottom: "24px" }}>🛡️</div>
              <h2 style={{ fontSize: "2rem", fontWeight: 900 }}>Guardian Portal</h2>
              <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "16px auto 32px", fontSize: "1.1rem" }}>
                Access your personal impact score, redeem ecosystem rewards, and track your verified oceanic contributions.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ padding: "16px 48px", borderRadius: "16px", fontSize: "1rem" }}>
                Sign In to Your Dashboard
              </Link>
            </div>
            {/* Global Stats when logged out */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <div className="glass-strong" style={{ padding: "32px", borderRadius: "24px" }}>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FiTrendingUp style={{ color: "var(--amber)" }} /> Top Guardians
                </h3>
                {guardianData.leaderboard.slice(0, 5).map(entry => (
                   <div key={entry.rank} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontWeight: 800 }}>#{entry.rank} {entry.guardianId}</span>
                      <span style={{ fontWeight: 900, color: "var(--guardian-gold)" }}>{entry.credits} CR</span>
                   </div>
                ))}
              </div>
              <div className="glass-strong" style={{ padding: "32px", borderRadius: "24px" }}>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FiActivity style={{ color: "var(--teal)" }} /> Global Impact
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                   <div>
                     <div style={{ fontSize: "2rem", fontWeight: 900 }}>12,450+</div>
                     <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>VERIFIED REPORTS FILED</div>
                   </div>
                   <div>
                     <div style={{ fontSize: "2rem", fontWeight: 900 }}>45.2M</div>
                     <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>CREDITS DISTRIBUTED</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar (Public Stats) - only if logged in */}
        {user && profile && renderSidebar()}

      </div>
    </div>
  );
}
