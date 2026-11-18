"use client";
// Browser-only image work: resizing uploads, sampling calibrated pixels and
// rendering the virtual drape grid.
import {
  applyCalibration, buildMeasurements, calibrationFromPaper, DRAPES, robustMedian,
  type Calibration, type ColorMeasurements, type RGB,
} from "./color";
import type { PhotoLocate } from "./schemas";

type Box = { x: number; y: number; w: number; h: number };
type LocatedPhoto = PhotoLocate["photos"][number];

export async function fileToDataUrl(file: File, maxSide = 1280, quality = 0.88): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function pixelsOf(img: HTMLImageElement): ImageData {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Median color inside a normalized box, shrunk inward to avoid edges. */
function sampleBox(data: ImageData, box: Box | null, opts: { shrink?: number; midtonesOnly?: boolean } = {}): RGB | null {
  if (!box) return null;
  const s = opts.shrink ?? 0.2;
  const x0 = Math.floor((box.x + box.w * s) * data.width), x1 = Math.ceil((box.x + box.w * (1 - s)) * data.width);
  const y0 = Math.floor((box.y + box.h * s) * data.height), y1 = Math.ceil((box.y + box.h * (1 - s)) * data.height);
  const px: RGB[] = [];
  const step = Math.max(1, Math.floor(Math.sqrt(((x1 - x0) * (y1 - y0)) / 4000)));
  for (let y = Math.max(0, y0); y < Math.min(data.height, y1); y += step) {
    for (let x = Math.max(0, x0); x < Math.min(data.width, x1); x += step) {
      const i = (y * data.width + x) * 4;
      px.push([data.data[i], data.data[i + 1], data.data[i + 2]]);
    }
  }
  if (opts.midtonesOnly) {
    // For the iris: drop pupil (very dark) and sclera/catchlights (very bright).
    const lum = (p: RGB) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
    const sorted = px.sort((a, b) => lum(a) - lum(b));
    return robustMedian(sorted.slice(Math.floor(sorted.length * 0.25), Math.floor(sorted.length * 0.75)));
  }
  return robustMedian(px);
}

const goodLight = (p: LocatedPhoto) => p.lighting === "daylight_good" && !p.filter_or_edit_suspected;

export type EngineResult = {
  measurements: ColorMeasurements & { otherPhotos: { photo: number; lighting: string; skinHex: string | null }[] };
  calibration: Calibration | null;
  primaryIndex: number | null;
  drapeGrid: string | null;
  drapeTiles: Record<string, string>;
};

/** The deterministic half of the analysis: calibrate, measure, drape. */
export async function runColorEngine(photos: string[], located: PhotoLocate): Promise<EngineResult> {
  const info = located.photos.filter((p) => p.index >= 0 && p.index < photos.length);
  const faces = info.filter((p) => p.face && p.usable_for.includes("color"));
  // Primary photo: a face photo with white paper, else the best-lit face photo.
  const primary =
    faces.find((p) => p.white_paper) ??
    faces.find(goodLight) ??
    faces[0] ??
    null;

  let measurements: EngineResult["measurements"];
  let calibration: Calibration | null = null;
  let drapeGrid: string | null = null;
  const drapeTiles: Record<string, string> = {};

  const images = await Promise.all(photos.map(loadImage));

  if (primary) {
    const img = images[primary.index];
    const data = pixelsOf(img);
    const paper = sampleBox(data, primary.white_paper, { shrink: 0.25 });
    calibration = paper ? calibrationFromPaper(paper) : null;
    const cal = (c: RGB | null) => (c ? applyCalibration(c, calibration) : null);

    const skinRegions = (["forehead", "left_cheek", "right_cheek", "jaw", "neck"] as const)
      .map((region) => ({ region, rgb: cal(sampleBox(data, primary[region])) }))
      .filter((r): r is { region: (typeof r)["region"]; rgb: RGB } => !!r.rgb);

    // Wrist baseline: a dedicated wrist photo (calibrated with its own paper if present).
    let wrist: RGB | null = null;
    const wristPhoto = info.find((p) => p.inner_wrist);
    if (wristPhoto) {
      const wd = wristPhoto.index === primary.index ? data : pixelsOf(images[wristPhoto.index]);
      const wPaper = sampleBox(wd, wristPhoto.white_paper, { shrink: 0.25 });
      const wCal = wPaper ? calibrationFromPaper(wPaper) : calibration;
      const raw = sampleBox(wd, wristPhoto.inner_wrist);
      wrist = raw ? applyCalibration(raw, wCal) : null;
    }

    measurements = {
      ...buildMeasurements({
        calibration,
        skinRegions,
        hair: cal(sampleBox(data, primary.hair)),
        eyes: cal(sampleBox(data, primary.iris, { shrink: 0.1, midtonesOnly: true })),
        lips: cal(sampleBox(data, primary.lips)),
        wrist,
      }),
      otherPhotos: [],
    };

    const drapes = renderDrapes(img, primary.face!, calibration);
    drapeGrid = drapes.grid;
    Object.assign(drapeTiles, drapes.tiles);
  } else {
    measurements = { ...buildMeasurements({ calibration: null, skinRegions: [] }), otherPhotos: [] };
  }

  // Cross-check: uncalibrated readings from the other face photos, so the AI
  // can see how much lighting shifts the result.
  for (const p of faces) {
    if (primary && p.index === primary.index) continue;
    const d = pixelsOf(images[p.index]);
    const cheek = sampleBox(d, p.left_cheek) ?? sampleBox(d, p.right_cheek) ?? sampleBox(d, p.forehead);
    measurements.otherPhotos.push({
      photo: p.index,
      lighting: p.lighting,
      skinHex: cheek ? "#" + cheek.map((v) => v.toString(16).padStart(2, "0")).join("") : null,
    });
  }

  return { measurements, calibration, primaryIndex: primary?.index ?? null, drapeGrid, drapeTiles };
}

/** Draw the calibrated face with each test color draped below the chin. */
function renderDrapes(img: HTMLImageElement, face: Box, calibration: Calibration | null) {
  const W = img.naturalWidth, H = img.naturalHeight;
  const fw = face.w * W, fh = face.h * H;
  const size = Math.min(Math.max(fh * 1.7, fw * 2), Math.min(W, H) * 1.2);
  const cx = (face.x + face.w / 2) * W;
  const top = face.y * H - fh * 0.2;
  const chinY = (face.y + face.h) * H;
  const T = 256;

  // Calibrated crop, drawn once.
  const crop = document.createElement("canvas");
  crop.width = T; crop.height = T;
  const cctx = crop.getContext("2d", { willReadFrequently: true })!;
  cctx.fillStyle = "#808080";
  cctx.fillRect(0, 0, T, T);
  cctx.drawImage(img, cx - size / 2, top, size, size, 0, 0, T, T);
  if (calibration) {
    const d = cctx.getImageData(0, 0, T, T);
    for (let i = 0; i < d.data.length; i += 4) {
      const [r, g, b] = applyCalibration([d.data[i], d.data[i + 1], d.data[i + 2]], calibration);
      d.data[i] = r; d.data[i + 1] = g; d.data[i + 2] = b;
    }
    cctx.putImageData(d, 0, 0);
  }
  const chin = ((chinY - top) / size) * T;
  const neckline = Math.min(T - 30, chin + T * 0.07);

  const grid = document.createElement("canvas");
  grid.width = T * 4; grid.height = T * 4;
  const g = grid.getContext("2d")!;
  const tiles: Record<string, string> = {};

  DRAPES.forEach((drape, i) => {
    const tile = document.createElement("canvas");
    tile.width = T; tile.height = T;
    const t = tile.getContext("2d")!;
    t.drawImage(crop, 0, 0);
    // Drape: fills the bottom of the frame with a soft scooped neckline.
    t.fillStyle = drape.hex;
    t.beginPath();
    t.moveTo(0, neckline - T * 0.04);
    t.quadraticCurveTo(T / 2, neckline + T * 0.12, T, neckline - T * 0.04);
    t.lineTo(T, T);
    t.lineTo(0, T);
    t.closePath();
    t.fill();
    tiles[drape.id] = tile.toDataURL("image/jpeg", 0.85);
    g.drawImage(tile, (i % 4) * T, Math.floor(i / 4) * T);
    g.fillStyle = "rgba(0,0,0,0.6)";
    g.fillRect((i % 4) * T + 6, Math.floor(i / 4) * T + 6, 30, 28);
    g.fillStyle = "#fff";
    g.font = "bold 20px sans-serif";
    g.fillText(drape.id, (i % 4) * T + 13, Math.floor(i / 4) * T + 27);
  });

  return { grid: grid.toDataURL("image/jpeg", 0.88), tiles };
}
