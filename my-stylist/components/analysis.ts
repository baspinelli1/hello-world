"use client";
import { runColorEngine } from "@/lib/image";
import type { PhotoLocate, Profile } from "@/lib/schemas";
import { api, type AppState } from "@/lib/store";

export const ANALYSIS_STEPS = [
  "Checking your photos",
  "Calibrating color against your white paper",
  "Measuring skin, hair and eyes",
  "Draping 16 test colors",
  "Reading color, body lines and essence",
];

export async function runAnalysis(
  state: AppState,
  onStep: (i: number) => void,
  refine?: { note: string }
): Promise<Pick<AppState, "profile" | "engine" | "demo"> & { missing: string[] }> {
  onStep(0);
  const loc = await api<PhotoLocate>("/api/locate", { photos: state.photos });
  onStep(1);
  const engine = await runColorEngine(state.photos, loc.result);
  onStep(2);
  await new Promise((r) => setTimeout(r, 300));
  onStep(3);
  await new Promise((r) => setTimeout(r, 300));
  onStep(4);

  // Send the photos the intake step marked as useful (max 8) to the main analysis.
  const useful = loc.result.photos
    .filter((p) => p.usable_for.length > 0 && state.photos[p.index])
    .slice(0, 8)
    .map((p) => ({
      dataUrl: state.photos[p.index],
      label: `Photo ${p.index} (${p.kind.replace("_", " ")}, ${p.lighting.replace("_", " ")}${p.filter_or_edit_suspected ? ", possibly filtered" : ""})`,
    }));

  const res = await api<Profile>("/api/analyze", {
    height: state.height,
    photos: useful.length ? useful : state.photos.slice(0, 8).map((dataUrl, i) => ({ dataUrl, label: `Photo ${i}` })),
    drapeGrid: engine.drapeGrid,
    measurements: engine.measurements,
    note: refine?.note,
    previous: refine ? state.profile : undefined,
  });

  const { drapeGrid: _grid, ...engineToKeep } = engine;
  return { profile: res.result, engine: engineToKeep, demo: res.demo || loc.demo, missing: loc.result.missing };
}
