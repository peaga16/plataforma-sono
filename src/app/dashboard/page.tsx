"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { AccessibilityMenu } from "@/components/accessibility-menu";
import { useLanguage } from "@/components/providers/language-provider";
import { getCurrentCycleFromProgress, isCycleComplete } from "@/lib/progress-rules";

interface Progress {
  day: number;
  completed: boolean;
  cycle: number;
}

interface Athlete {
  id: string;
  name: string;
  code: string | null;
  email: string;
  progresses: Progress[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [, setRenderTrigger] = useState(0);

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkNames, setBulkNames] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<
    { name: string; code: string }[] | null
  >(null);
  const [tab, setTab] = useState<"athletes" | "register">("athletes");
  const [expandedAthlete, setExpandedAthlete] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setRenderTrigger(prev => prev + 1);
  }, [language]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "admin") {
      router.replace("/login");
      return;
    }
    fetchAthletes();
  }, [status, session, router]);

  async function fetchAthletes() {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    setAthletes(await res.json());
    setLoading(false);
  }

  async function handleBulkRegister() {
    const names = bulkNames
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    if (!names.length) return;

    setBulkLoading(true);
    setBulkResult(null);

    const res = await fetch("/api/batch-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athletes: names }),
    });

    const data = await res.json();
    setBulkLoading(false);

    if (res.ok) {
      setBulkResult(data.created);
      setBulkNames("");
      fetchAthletes();
      setTab("athletes");
    } else {
      alert(data.error || t("registerError"));
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    const confirmDelete = confirm(t("deleteConfirm"));
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || t("deleteUserError"));
        return;
      }

      setAthletes((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      alert(t("deleteUserError"));
    }
  }

  function handleSignOut() {
    signOut({ callbackUrl: "/" });
  }

  function groupByCycle(progresses: Progress[]) {
    const cycles: Record<number, number[]> = {};
    progresses
      .filter((p) => p.completed)
      .forEach((p) => {
        if (!cycles[p.cycle]) cycles[p.cycle] = [];
        cycles[p.cycle].push(p.day);
      });
    return cycles;
  }

  const athleteList = athletes.filter((u) => u.code?.startsWith("ATL"));
  const totalAthletes = athleteList.length;

  const totalCompleted = athleteList.filter((u) => {
    const cycles = groupByCycle(u.progresses);
    return Object.values(cycles).some((days) => isCycleComplete(days));
  }).length;

  const avgProgress = totalAthletes
    ? Math.round(
      (athleteList.reduce((sum, u) => {
        const currentCycle = getCurrentCycleFromProgress(u.progresses);
        const daysInCurrentCycle = u.progresses.filter(
          (p) => p.completed && p.cycle === currentCycle
        ).length;
        return sum + daysInCurrentCycle;
      }, 0) /
        totalAthletes /
        7) *
      100
    )
    : 0;

  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'DM Sans',sans-serif",
    background: active ? "#fff" : "transparent",
    color: active ? "var(--navy)" : "rgba(248,249,252,0.65)",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
    transition: "all 0.15s",
    whiteSpace: "nowrap" as const,
  });

  if (status === "loading" || loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--off-white)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--muted)", fontFamily: "'DM Sans',sans-serif" }}>
          {t("dashboardLoading")}
        </p>
      </main>
    );
  }

  return (
    <>
      {/* Responsive styles injected inline */}
      <style>{`
        .dash-header {
          background: var(--navy);
          height: 64px;
          padding: 0 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .dash-nav-group {
          display: flex;
          background: rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 4px;
          gap: 2px;
        }
        .dash-signout {
          color: rgba(248,249,252,0.5);
          font-size: 12px;
          font-family: 'DM Sans',sans-serif;
          text-decoration: none;
          white-space: nowrap;
        }
        .dash-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px;
        }
        .dash-stats-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        .dash-stat-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px 28px;
        }
        .dash-table-wrapper {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .dash-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 620px;
        }
        .dash-athletes-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
        }
        .dash-register-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 40px;
          max-width: 600px;
          margin: 0 auto;
        }
        .dash-textarea {
          width: 100%;
          padding: 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: 'DM Sans',sans-serif;
          font-size: 14px;
          resize: vertical;
          min-height: 160px;
          outline: none;
          color: var(--navy);
          background: var(--off-white);
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .dash-textarea:focus {
          border-color: var(--accent);
          background: #fff;
        }
        .dash-btn-primary {
          background: var(--navy);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans',sans-serif;
          width: 100%;
          transition: opacity 0.15s;
        }
        .dash-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .dash-result-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }
        .dash-result-table th, .dash-result-table td {
          padding: 10px 14px;
          text-align: left;
          font-family: 'DM Sans',sans-serif;
          font-size: 13px;
        }
        .dash-result-table th {
          background: var(--off-white);
          color: var(--muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .dash-result-table tr + tr td {
          border-top: 1px solid var(--border);
        }
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: rgba(248,249,252,0.8);
          flex-direction: column;
          gap: 5px;
        }
        .mobile-menu-toggle span {
          display: block;
          width: 22px;
          height: 2px;
          background: currentColor;
          border-radius: 2px;
        }
        .mobile-menu-dropdown {
          display: none;
          background: var(--navy-mid);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 12px 20px;
          flex-direction: column;
          gap: 4px;
        }
        .mobile-menu-dropdown.open {
          display: flex;
        }
        .mobile-nav-btn {
          padding: 10px 14px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans',sans-serif;
          background: transparent;
          color: rgba(248,249,252,0.7);
          text-align: left;
          width: 100%;
          transition: background 0.15s;
          text-decoration: none;
          display: block;
        }
        .mobile-nav-btn.active {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        @media (max-width: 768px) {
          .dash-header {
            padding: 0 20px;
            height: 56px;
          }
          .dash-nav-group {
            display: none;
          }
          .dash-signout {
            display: none;
          }
          .mobile-menu-toggle {
            display: flex;
          }
          .dash-content {
            padding: 24px 16px;
          }
          .dash-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .dash-stat-card {
            padding: 16px 18px;
          }
          .dash-athletes-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .dash-register-card {
            padding: 24px 20px;
          }
        }

        @media (max-width: 480px) {
          .dash-stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-dropdown {
            display: none !important;
          }
        }
      `}</style>

      <main style={{ minHeight: "100vh", background: "var(--off-white)" }}>
        {/* Header */}
        <header className="dash-header">
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: "linear-gradient(135deg,#2B6CB0,#4A90D9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                🌙
              </div>
              <span
                style={{
                  color: "#F8F9FC",
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                }}
              >
                {t("platformName")}
              </span>
            </div>

            <span
              style={{
                color: "rgba(255,255,255,0.2)",
                display: "none",
              }}
              className="desktop-divider"
            >
              |
            </span>
          </div>

          {/* Desktop nav */}
          <div className="dash-nav-group">
            <button onClick={() => setTab("athletes")} style={navBtnStyle(tab === "athletes")}>
              {t("athletesLabel")}
            </button>
            <button onClick={() => setTab("register")} style={navBtnStyle(tab === "register")}>
              {t("registerLabel")}
            </button>
            <a
              href="/dashboard/qrcodes"
              style={{ ...navBtnStyle(false), textDecoration: "none", display: "inline-block" }}
            >
              {t("qrcodesLabel")}
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <AccessibilityMenu variant="dark" />

            <button className="dash-signout" type="button" onClick={handleSignOut}>
              {t("signOut")}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        {/* Mobile dropdown nav */}
        <div className={`mobile-menu-dropdown ${mobileMenuOpen ? "open" : ""}`}>
          <button
            className={`mobile-nav-btn ${tab === "athletes" ? "active" : ""}`}
            onClick={() => { setTab("athletes"); setMobileMenuOpen(false); }}
          >
            {t("athletesLabel")}
          </button>
          <button
            className={`mobile-nav-btn ${tab === "register" ? "active" : ""}`}
            onClick={() => { setTab("register"); setMobileMenuOpen(false); }}
          >
            {t("registerLabel")}
          </button>
          <a
            href="/dashboard/qrcodes"
            className="mobile-nav-btn"
          >
            {t("qrcodesLabel")}
          </a>
          <button
            type="button"
            className="mobile-nav-btn"
            style={{ color: "#F87171", background: "none", border: "none", cursor: "pointer" }}
            onClick={handleSignOut}
          >
            {t("signOut")}
          </button>
        </div>

        {/* Main content */}
        <div className="dash-content">
          {/* Stats cards */}
          <div className="dash-stats-grid">
            {[
              { label: t("registeredAthletes"), value: totalAthletes, icon: "👤" },
              { label: t("completedCycles"), value: totalCompleted, icon: "🏆" },
              { label: t("averageProgress"), value: `${avgProgress}%`, icon: "📊" },
            ].map((card) => (
              <div key={card.label} className="dash-stat-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      color: "var(--muted)",
                      fontSize: 11,
                      fontFamily: "'DM Sans',sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {card.label}
                  </span>
                  <span style={{ fontSize: 18 }}>{card.icon}</span>
                </div>
                <p
                  style={{
                    fontFamily: "'DM Serif Display',serif",
                    fontSize: 36,
                    color: "var(--navy)",
                    margin: 0,
                  }}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Athletes tab */}
          {tab === "athletes" && (
            <>
              <div className="dash-athletes-header">
                <h2
                  style={{
                    fontFamily: "'DM Serif Display',serif",
                    fontSize: 26,
                    color: "var(--navy)",
                    margin: 0,
                    fontWeight: 400,
                  }}
                >
                  {t("athletesCount", { count: totalAthletes.toString() })}
                </h2>

                <button
                  onClick={() => setTab("register")}
                  style={{
                    background: "var(--navy)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("registerAthletesCTA")}
                </button>
              </div>

              <div className="dash-table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--off-white)" }}>
                      {[t("athleteHeading"), t("codeHeading"), t("currentCycleHeading"), t("currentProgressHeading"), t("historyHeading"), ""].map((h) => (
                        <th
                          key={String(h)}
                          style={{
                            padding: "12px 20px",
                            textAlign: "left",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--muted)",
                            fontFamily: "'DM Sans',sans-serif",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {athleteList.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: "48px 20px",
                            textAlign: "center",
                            color: "var(--muted)",
                            fontFamily: "'DM Sans',sans-serif",
                            fontSize: 14,
                          }}
                        >
                          {t("noAthletesYet")} {" "}
                          <button
                            onClick={() => setTab("register")}
                            style={{
                              color: "var(--accent)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "'DM Sans',sans-serif",
                              fontSize: 14,
                              textDecoration: "underline",
                            }}
                          >
                            {t("registerNow")}
                          </button>
                        </td>
                      </tr>
                    )}

                    {athleteList.map((user) => {
                      const currentCycle = getCurrentCycleFromProgress(user.progresses);
                      const cycles = groupByCycle(user.progresses);

                      const currentCycleDays = user.progresses
                        .filter((p) => p.completed && p.cycle === currentCycle)
                        .map((p) => p.day);

                      const pct = Math.round((currentCycleDays.length / 7) * 100);
                      const totalCycles = Object.keys(cycles).length;
                      const completedCycles = Object.values(cycles).filter((days) => isCycleComplete(days)).length;
                      const isExpanded = expandedAthlete === user.id;

                      return (
                        <>
                          <tr
                            key={user.id}
                            style={{
                              borderBottom: "1px solid var(--off-white)",
                              background: isExpanded ? "#F8FAFF" : "#fff",
                            }}
                          >
                            <td style={{ padding: "16px 20px" }}>
                              <p
                                style={{
                                  fontFamily: "'DM Sans',sans-serif",
                                  fontSize: 14,
                                  fontWeight: 500,
                                  color: "var(--navy)",
                                  margin: 0,
                                }}
                              >
                                {user.name}
                              </p>
                            </td>

                            <td style={{ padding: "16px 20px" }}>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: "var(--navy)",
                                  background: "var(--off-white)",
                                  padding: "4px 10px",
                                  borderRadius: 6,
                                }}
                              >
                                {user.code}
                              </span>
                            </td>

                            <td style={{ padding: "16px 20px" }}>
                              <span
                                style={{
                                  background: "#EFF6FF",
                                  color: "#2B6CB0",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  padding: "4px 10px",
                                  borderRadius: 100,
                                  fontFamily: "'DM Sans',sans-serif",
                                }}
                              >
                                {t("cycleLabel")} {currentCycle}
                              </span>
                            </td>

                            <td style={{ padding: "16px 20px", minWidth: 180 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                                  <div
                                    key={d}
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: 4,
                                      fontSize: 10,
                                      fontFamily: "'DM Sans',sans-serif",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: 600,
                                      background: currentCycleDays.includes(d) ? "#2B6CB0" : "var(--off-white)",
                                      color: currentCycleDays.includes(d) ? "#fff" : "var(--muted)",
                                    }}
                                  >
                                    {d}
                                  </div>
                                ))}
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    flex: 1,
                                    background: "var(--off-white)",
                                    borderRadius: 100,
                                    height: 5,
                                  }}
                                >
                                  <div
                                    style={{
                                      background: pct === 100 ? "#16A34A" : "#2B6CB0",
                                      height: 5,
                                      borderRadius: 100,
                                      width: `${pct}%`,
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif" }}>
                                  {pct}%
                                </span>
                              </div>
                            </td>

                            <td style={{ padding: "16px 20px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: "var(--navy)", fontWeight: 500 }}>
                                  {completedCycles === 1 ? t("cycleCompletedSingle") : t("cycleCompletedMultiple", { count: completedCycles.toString() })}
                                </span>
                                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif" }}>
                                  {totalCycles === 1 ? t("cycleStartedSingle") : t("cycleStartedMultiple", { count: totalCycles.toString() })}
                                </span>
                              </div>
                            </td>

                            <td style={{ padding: "16px 20px" }}>
                              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                {totalCycles > 0 && (
                                  <button
                                    onClick={() => setExpandedAthlete(isExpanded ? null : user.id)}
                                    style={{
                                      fontSize: 12,
                                      color: "#2B6CB0",
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      fontFamily: "'DM Sans',sans-serif",
                                      textDecoration: "underline",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {isExpanded ? t("close") : t("viewHistory")}
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  style={{
                                    fontSize: 12,
                                    color: "#DC2626",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "'DM Sans',sans-serif",
                                    textDecoration: "underline",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {t("deleteButton")}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr style={{ background: "#F8FAFF" }}>
                              <td colSpan={6} style={{ padding: "12px 20px 20px" }}>
                                <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", marginBottom: 10, marginTop: 0 }}>
                                  {t("cyclesHistoryHeading")}
                                </p>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                  {Object.entries(groupByCycle(user.progresses)).map(([cycle, days]) => (
                                    <div
                                      key={cycle}
                                      style={{
                                        background: isCycleComplete(days) ? "#DCFCE7" : "#EFF6FF",
                                        border: `1px solid ${isCycleComplete(days) ? "#16A34A" : "#2B6CB0"}`,
                                        borderRadius: 8,
                                        padding: "8px 14px",
                                      }}
                                    >
                                      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: isCycleComplete(days) ? "#16A34A" : "#2B6CB0", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        {t("cycleLabel")} {cycle} {isCycleComplete(days) ? "✓" : ""}
                                      </p>
                                      <p style={{ margin: 0, fontSize: 12, color: "var(--navy)", fontFamily: "'DM Sans',sans-serif" }}>
                                        {days.sort((a, b) => a - b).map((d) => t("dayLabel", { day: d.toString() })).join(", ")}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ✅ Register tab — previously missing! */}
          {tab === "register" && (
            <div className="dash-register-card">
              <h2
                style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: 24,
                  color: "var(--navy)",
                  margin: "0 0 6px",
                  fontWeight: 400,
                }}
              >
                {t("registerAthletesTitle")}
              </h2>
              <p style={{ color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, margin: "0 0 28px" }}>
                {t("registerAthletesDescription")}
              </p>

              <label style={{ display: "block", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {t("athleteNamesLabel")}
                </span>
              </label>

              <textarea
                className="dash-textarea"
                placeholder={t("bulkNamesPlaceholder")}
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
              />

              <div style={{ marginTop: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif" }}>
                  {t("athletesToRegister", { count: bulkNames.split("\n").filter((n) => n.trim()).length.toString() })}
                </span>
              </div>

              <button
                className="dash-btn-primary"
                onClick={handleBulkRegister}
                disabled={bulkLoading || !bulkNames.trim()}
              >
                {bulkLoading ? t("registeringAthletes") : t("registerAthletesButton")}
              </button>

              {bulkResult && (
                <div style={{ marginTop: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>✅</span>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: "#16A34A", margin: 0 }}>
                      {t("bulkResultSuccess", { count: bulkResult.length.toString() })}
                    </p>
                  </div>

                  <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                    <table className="dash-result-table">
                      <thead>
                        <tr>
                          <th>{t("nameHeading")}</th>
                          <th>{t("codeHeading")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkResult.map((r) => (
                          <tr key={r.code}>
                            <td style={{ color: "var(--navy)", fontWeight: 500 }}>{r.name}</td>
                            <td>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: "var(--navy)",
                                  background: "var(--off-white)",
                                  padding: "3px 8px",
                                  borderRadius: 4,
                                }}
                              >
                                {r.code}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => setTab("athletes")}
                    style={{
                      marginTop: 16,
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "10px 20px",
                      fontSize: 13,
                      fontFamily: "'DM Sans',sans-serif",
                      cursor: "pointer",
                      color: "var(--navy)",
                      width: "100%",
                    }}
                  >
                    {t("viewAthleteListButton")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
