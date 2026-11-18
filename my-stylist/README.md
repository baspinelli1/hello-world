# My Stylist

A technical AI stylist. From a few photos and your height, it works out your **color season**, **Kibbe body type** and **Kitchener style essence**, then suggests outfits, checks outfits you send it, reads your Pinterest saves and builds a thrifting list.

## How the color analysis works
1. **Calibration:** a selfie holding white paper lets the app remove the camera's color cast and fix exposure, which matters most for deeper skin.
2. **Measurement (code, `lib/color.ts`):** skin is sampled from several face regions and measured in CIELAB, giving the ITA° skin angle, the Monk Skin Tone Scale index, hue angle, and an **olive score** (low red plus muted chroma), separate from warm and cool.
3. **Tan vs undertone:** an optional inner-wrist photo gives a baseline to separate tan or redness from undertone.
4. **Virtual draping (`lib/image.ts`):** 16 test colors are drawn under the calibrated face, and Claude judges them like an in-person analyst.
5. **Judgment (Claude):** measurements, drapes and photos are combined into four dimensions (hue, value, chroma, contrast), a season with a confidence level and runner-up, and a personal palette, including a tan-season shift.

## Run it
```bash
npm install
cp .env.example .env.local   # add your Claude API key
npm run dev                  # http://localhost:3000
```
Without an API key the app runs in **sample mode** with example results, so you can click through every screen.

## Privacy
Profile, photos, looks and lists are stored only in the browser (IndexedDB). Photos are sent to Claude for analysis and are not stored on a server.

## Stack
Next.js 15 (App Router), TypeScript, Anthropic SDK (structured outputs + web search for trend briefs).
