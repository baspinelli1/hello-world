"use client";
import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "ms-install-dismissed";

/** Offers "Add to Home Screen": a real button on Android/Chrome, instructions on iPhone. */
export default function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    let dismissed = false;
    try { dismissed = localStorage.getItem(KEY) === "1"; } catch {}
    if (standalone || dismissed) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIos(isIos);
    if (isIos) setShow(true);
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); setShow(true); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setShow(false);
    try { localStorage.setItem(KEY, "1"); } catch {}
  }

  if (!show) return null;
  return (
    <div className="install" role="region" aria-label="Install My Stylist">
      <img src="/icon-192.png" alt="" />
      <div className="grow">
        <strong>Get the app</strong>
        <div className="muted">
          {ios ? <>Tap the Share button <svg aria-label="Share" width="14" height="17" viewBox="0 0 14 17" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ verticalAlign: "-2px" }}><path d="M7 1v10M3.5 4.5 7 1l3.5 3.5M4 7H2v9h10V7h-2" strokeLinecap="round" strokeLinejoin="round" /></svg>, then <strong>Add to Home Screen</strong>.</> : "Add My Stylist to your home screen."}
        </div>
      </div>
      {!ios && evt && (
        <button className="btn sm accent" onClick={async () => { await evt.prompt(); await evt.userChoice; setShow(false); }}>Install</button>
      )}
      <button className="x" onClick={dismiss} aria-label="Dismiss">×</button>
    </div>
  );
}
