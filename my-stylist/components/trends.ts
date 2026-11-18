"use client";
import { api, type AppState } from "@/lib/store";

const WEEK = 7 * 24 * 3600 * 1000;

/** Current trends brief from a web search, cached on the device for a week. */
export async function getTrends(state: AppState, update: (p: Partial<AppState>) => void): Promise<string> {
  if (state.trends && Date.now() - state.trends.fetchedAt < WEEK) return state.trends.text;
  try {
    const { result } = await api<string>("/api/trends");
    update({ trends: { text: result, fetchedAt: Date.now() } });
    return result;
  } catch {
    return "";
  }
}
