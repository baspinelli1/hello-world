"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import CheckView from "@/components/CheckView";
import InspoView from "@/components/InspoView";
import LooksView from "@/components/LooksView";
import Onboarding from "@/components/Onboarding";
import ProfileView from "@/components/ProfileView";
import ShoppingView from "@/components/ShoppingView";
import { clearState, emptyState, loadState, saveState, type AppState } from "@/lib/store";

const TABS = [
  { id: "profile", label: "Profile", ico: "◐" },
  { id: "looks", label: "Looks", ico: "✦" },
  { id: "check", label: "Check", ico: "◎" },
  { id: "inspo", label: "Inspo", ico: "❖" },
  { id: "shop", label: "List", ico: "☰" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function Home() {
  const [state, setState] = useState<AppState | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  const latest = useRef<AppState>(emptyState);

  useEffect(() => {
    loadState().then((s) => { latest.current = s; setState(s); });
  }, []);

  const update = useCallback((patch: Partial<AppState>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setState(next);
    saveState(next);
  }, []);

  async function restart() {
    if (!confirm("Start over? Your profile and photos on this device will be cleared. Your looks and shopping list stay.")) return;
    update({ profile: null, engine: null, photos: [], source: null, quizAnswers: null, colorPhoto: null });
    setTab("profile");
  }

  if (!state) return <main className="shell" />;

  return (
    <main className="shell">
      <header className="masthead">
        <p className="brand">Maven<em>.</em></p>
        <a href="/learn" className="kicker" style={{ textDecoration: "none" }}>Learn</a>
      </header>
      {!state.profile ? (
        <Onboarding state={state} update={update} />
      ) : (
        <>
          {tab === "profile" && <ProfileView state={state} update={update} restart={restart} />}
          {tab === "looks" && <LooksView state={state} update={update} />}
          {tab === "check" && <CheckView state={state} update={update} />}
          {tab === "inspo" && <InspoView state={state} update={update} />}
          {tab === "shop" && <ShoppingView state={state} update={update} />}
          <div className="tabs">
            <nav>
              {TABS.map((t) => (
                <button key={t.id} className={`tab${tab === t.id ? " on" : ""}`} onClick={() => { setTab(t.id); window.scrollTo(0, 0); }}>
                  <span className="ico" aria-hidden>
                    {t.ico}
                    {t.id === "shop" && state.shopping.filter((i) => !i.bought).length > 0 && <span className="count">{state.shopping.filter((i) => !i.bought).length}</span>}
                  </span>{t.label}
                </button>
              ))}
            </nav>
          </div>
          <p className="muted small" style={{ textAlign: "center", marginTop: 30 }}>
            Everything is saved on this device only. <button className="linkish" onClick={async () => { if (confirm("Delete all Maven data on this device?")) { await clearState(); location.reload(); } }}>Delete my data</button>
          </p>
        </>
      )}
    </main>
  );
}
