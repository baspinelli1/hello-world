"use client";
// Everything is stored on the user's own device (IndexedDB). Nothing is kept
// on a server; photos only leave the device to be analyzed.
import type { Critique, Inspo, Look, Profile } from "./schemas";
import type { EngineResult } from "./image";

export type ShoppingItem = {
  id: string;
  name: string;
  color_hex: string;
  is_basic: boolean;
  thrift_search_terms: string;
  from: string; // which look or check it came from
  bought: boolean;
};

export type JournalEntry = { id: string; image: string; context: string; critique: Critique; date: string };

export type AppState = {
  height: string;
  photos: string[];
  profile: Profile | null;
  engine: Omit<EngineResult, "drapeGrid"> | null;
  demo: boolean;
  looks: Look[];
  liked: Look[];
  disliked: Look[];
  owned: string[]; // "lookId::itemName"
  shopping: ShoppingItem[];
  journal: JournalEntry[];
  trends: { text: string; fetchedAt: number } | null;
  inspo: { board: string; images: string[]; result: Inspo | null } | null;
};

export const emptyState: AppState = {
  height: "", photos: [], profile: null, engine: null, demo: false, looks: [], liked: [], disliked: [],
  owned: [], shopping: [], journal: [], trends: null, inspo: null,
};

const DB = "my-stylist", STORE = "kv", KEY = "state";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadState(): Promise<AppState> {
  try {
    const db = await open();
    return await new Promise((resolve) => {
      const req = db.transaction(STORE).objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve({ ...emptyState, ...(req.result ?? {}) });
      req.onerror = () => resolve(emptyState);
    });
  } catch {
    return emptyState;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    const db = await open();
    db.transaction(STORE, "readwrite").objectStore(STORE).put(state, KEY);
  } catch {
    // Private browsing can block storage; the app still works for this visit.
  }
}

export async function clearState(): Promise<void> {
  try {
    const db = await open();
    db.transaction(STORE, "readwrite").objectStore(STORE).delete(KEY);
  } catch {}
}

export async function api<T>(path: string, body?: unknown): Promise<{ result: T; demo: boolean }> {
  const res = await fetch(path, body === undefined ? undefined : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({ error: "Unexpected response from the server." }));
  if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
  return json;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
