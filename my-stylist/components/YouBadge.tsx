"use client";
import { useEffect, useState } from "react";
import { findEntry, type SystemId } from "@/lib/learn";
import { loadState } from "@/lib/store";

/** Shows "You" when this page matches the visitor's own result (read from their device). */
export default function YouBadge({ system, slug }: { system: SystemId; slug: string }) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    loadState().then((s) => {
      const p = s.profile;
      if (!p) return;
      const names = system === "seasons" ? [p.color.season] : system === "kibbe" ? [p.body.kibbe_type] : [p.essence.primary, p.essence.secondary];
      setMatch(names.some((n) => findEntry(system, n)?.slug === slug));
    });
  }, [system, slug]);
  return match ? <span className="badge you">You</span> : null;
}
